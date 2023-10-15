// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import "./NFT.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract DebitaV1 is ERC1155Holder, ReentrancyGuard {
    error notEnoughFunds();
    error requirementsNotFull();

    event LenderOfferCreated(
        uint256 indexed id,
        address indexed _owner,
        address lendingToken,
        uint apr,
        uint lendingAmount
    );
    event LenderOfferDeleted(uint256 indexed id, address indexed _owner);
    event CollateralOfferCreated(
        uint256 indexed id,
        address indexed _owner,
        address lendingToken,
        uint apr,
        uint lendingAmount
    );
    event CollateralOfferDeleted(uint256 indexed id, address indexed _owner);
    event LoanAccepted(
        uint256 newId,
        address indexed lendingToken,
        address[] indexed collateralTokens
    );

    address immutable owner;
    address feeAddress;
    // Id of the Lender Offer ID
    uint256 public Lender_OF_ID;
    // Id of the Collateral Offer ID
    uint256 public Collateral_OF_ID;
    uint256 public LOAN_ID;
    // OWNERSHIP CONTRACT
    address NFT_CONTRACT;
    // Id count of the ownership NFT minted
    uint32 NFT_ID;
    bool private initialized;

    // Lender & Collateral struct is the same right now, will be one  --> struct OfferInfo {}
    struct LenderOInfo {
        address LenderToken;
        address[] wantedCollateralTokens;
        uint256[] wantedCollateralAmount;
        uint256 LenderAmount;
        uint256 interest;
        uint256 timelap;
        uint256 paymentCount;
        address[] whitelist;
        address owner;
    }

    struct CollateralOInfo {
        address wantedLenderToken;
        address[] collaterals;
        uint256[] collateralAmount;
        uint256 wantedLenderAmount;
        uint256 interest;
        uint256 timelap;
        uint256 paymentCount;
        address[] whitelist;
        address owner;
    }

    struct LoanInfo {
        uint32 collateralOwnerID;
        uint32 LenderOwnerId;
        address LenderToken;
        uint256 LenderAmount;
        address[] collaterals;
        uint256[] collateralAmount;
        uint256 timelap;
        uint256 paymentCount;
        uint256 paymentsPaid;
        uint256 paymentAmount;
        uint256 deadline;
        uint256 deadlineNext;
        bool executed;
    }

    // Lender ID => All Info About the Offer
    mapping(uint256 => LenderOInfo) internal LendersOffers;
    // Collateral ID => All Info About the Collateral
    mapping(uint256 => CollateralOInfo) internal CollateralOffers;
    // Loan ID => All Info about the Loan
    mapping(uint256 => LoanInfo) internal Loans;

    // NFT ID => Loan ID
    mapping(uint256 => uint256) public loansByNFt;
    // NFT ID => CLAIMEABLE DEBT
    mapping(uint256 => uint256) public claimeableDebt;

    constructor() {
        owner = msg.sender;
        feeAddress = msg.sender;
    }

    modifier onlyFeeAdd() {
        if (msg.sender != feeAddress) {
            revert();
        }
        _;
    }

    modifier onlyInit() {
        if (msg.sender != owner || initialized) {
            revert();
        }
        _;
        initialized = true;
    }

    // This function allows a lender to create a lending option, specifying the terms and conditions of the loan.
    // The lender can specify the token they want to lend, the collateral tokens they require, the loan amount, interest rate, time period, number of payments, and a whitelist of addresses.
    // The function validates the input parameters, and transfers the lender's tokens to the contract.
    // It then stores the lender offer information and emits an event to notify the creation of the lending option.
    /**
     * @dev Creates a lender option for offering a loan by the lender.
     * @param _LenderToken The address of the token that the lender wants to lend.
     * @param _wantedCollateralTokens An array of addresses representing the collateral tokens desired by the lender.
     * @param _wantedCollateralAmount An array of corresponding amounts of the collateral tokens desired by the lender.
     * @param _LenderAmount The amount of the lender's token to be lent.
     * @param _interest The interest rate for the loan. 10 --> 1% && 1 --> 0.1%
     * @param _timelap The time period for the loan in seconds.
     * @param _paymentCount The number of payments expected from the borrower.
     * @param _whitelist An array of whitelisted addresses.
     */
    function createLenderOption(
        address _LenderToken,
        address[] memory _wantedCollateralTokens,
        uint256[] memory _wantedCollateralAmount,
        uint256 _LenderAmount,
        uint256 _interest,
        uint256 _timelap,
        uint256 _paymentCount,
        address[] memory _whitelist
    ) public payable nonReentrant() {
        if (
            _timelap < 1 days ||
            _timelap > 365 days ||
            _wantedCollateralTokens.length != _wantedCollateralAmount.length ||
            _LenderAmount == 0 ||
            _paymentCount > 1000 ||
            _paymentCount > _LenderAmount ||
            _whitelist.length > 2
        ) {
            revert();
        }

        if (_LenderToken == address(0x0)) {
            // If the lender's token is Ether (address(0x0)), check if the transaction value is greater than or equal to the lender amount
            require(msg.value >= _LenderAmount);
        } else {
            // If the lender's token is not Ether, transfer the lender amount from the sender to the contract address
            IERC20 B_Token = IERC20(_LenderToken);
            // Check Taxable Tokens --> If it's taxable token, revert
            uint balanceBefore = B_Token.balanceOf(address(this));
            bool success = B_Token.transferFrom(
                msg.sender,
                address(this),
                _LenderAmount
            );
            require(success);
            uint balanceAfter = B_Token.balanceOf(address(this));
            require(
                (balanceAfter - balanceBefore) == _LenderAmount,
                "Taxable Token"
            );
        }

        Lender_OF_ID++;
        // Create a new LenderOInfo struct with the provided information
        LenderOInfo memory lastLender = LenderOInfo({
            LenderToken: _LenderToken,
            wantedCollateralTokens: _wantedCollateralTokens,
            wantedCollateralAmount: _wantedCollateralAmount,
            LenderAmount: _LenderAmount,
            interest: _interest,
            timelap: _timelap,
            paymentCount: _paymentCount,
            whitelist: _whitelist,
            owner: msg.sender
        });
        LendersOffers[Lender_OF_ID] = lastLender;
        emit LenderOfferCreated(
            Lender_OF_ID,
            msg.sender,
            _LenderToken,
            _interest,
            _LenderAmount
        );
    }

    // Cancel Lender Offer
    function cancelLenderOffer(uint256 id) public nonReentrant() {
        LenderOInfo memory _LenderINFO = LendersOffers[id];
        if (_LenderINFO.owner != msg.sender) {
            revert();
        }
        delete LendersOffers[id];
        if (_LenderINFO.LenderToken != address(0x0)) {
            IERC20 B_TOKEN = IERC20(_LenderINFO.LenderToken);
            bool success = B_TOKEN.transfer(
                msg.sender,
                _LenderINFO.LenderAmount
            );
            require(success);
        } else {
            (bool success, ) = msg.sender.call{value: _LenderINFO.LenderAmount}(
                ""
            );
            require(success, "Transaction failed");
        }
        emit LenderOfferDeleted(id, msg.sender);
    }

    // User A offers to provide some collateral, such as a valuable asset, to User B in exchange for the loan. User B agrees to lend the money to User A under the condition that User A puts up the collateral as security for the loan.

    /**
     * @dev Creates a collateral offer for a loan by the borrower.
     * @param _wantedLenderToken The address of the token that the borrower wants to borrow.
     * @param collateralTokens An array of addresses representing the collateral tokens being offered.
     * @param collateralAmount An array of corresponding amounts of the collateral tokens being offered.
     * @param _wantedLenderAmount The desired amount of the lender's token by the borrower.
     * @param _interest The interest rate for the loan.  1 --> 0.1%
     * @param _timelap The time period for the loan in seconds.
     * @param _paymentCount The number of payments to be made by the borrower.
     * @param _whitelist An array of whitelisted addresses.
     */

    function createCollateralOffer(
        address _wantedLenderToken,
        address[] memory collateralTokens,
        uint256[] memory collateralAmount,
        uint256 _wantedLenderAmount,
        uint256 _interest,
        uint256 _timelap,
        uint256 _paymentCount,
        address[] memory _whitelist
    ) public payable nonReentrant() {
        // Check various conditions before creating the collateral offer
        // 1. Check if the time lapse is between 1 day and 365 days
        // 2. Check if the lengths of collateralTokens and collateralAmount arrays are equal
        // 3. Check if the wanted lender amount is non-zero
        // 4. Check if the payment count is less than or equal to 100
        // 5. Check if the payment count is less than or equal to the wanted lender amount
        // 6. Check if the length of the whitelist array is at most 2

        if (
            _timelap < 1 days ||
            _timelap > 365 days ||
            collateralTokens.length != collateralAmount.length ||
            _wantedLenderAmount == 0 ||
            _paymentCount > 100 ||
            _paymentCount > _wantedLenderAmount ||
            _whitelist.length > 2
        ) {
            revert();
        }
        uint256 amountWEI;
        for (uint256 i; i < collateralTokens.length; i++) {
            if (collateralTokens[i] == address(0x0)) {
                // Check if the collateral token is Ether (address(0x0)) and Sum up the collateral amount in Wei
                amountWEI += collateralAmount[i];
            } else {
                // If the collateral token is not Ether, transfer the collateral amount from the sender to the contract address
                IERC20 ERC20_TOKEN = IERC20(collateralTokens[i]);
                uint balanceBefore = ERC20_TOKEN.balanceOf(address(this));
                bool success = ERC20_TOKEN.transferFrom(
                    msg.sender,
                    address(this),
                    collateralAmount[i]
                );
                require(success);
                uint balanceAfter = ERC20_TOKEN.balanceOf(address(this));
                require(
                    (balanceAfter - balanceBefore) == collateralAmount[i],
                    "Taxable Token"
                );
            }
        }
        // Check if the transaction value is greater than or equal to the total collateral amount in Wei
        require(msg.value >= amountWEI, "Not Enough ETHER");

        Collateral_OF_ID++;
        // Create a new CollateralOInfo struct with the provided information
        CollateralOInfo memory lastCollateral = CollateralOInfo({
            wantedLenderToken: _wantedLenderToken,
            collaterals: collateralTokens,
            collateralAmount: collateralAmount,
            wantedLenderAmount: _wantedLenderAmount,
            interest: _interest,
            timelap: _timelap,
            paymentCount: _paymentCount,
            whitelist: _whitelist,
            owner: msg.sender
        });
        CollateralOffers[Collateral_OF_ID] = lastCollateral;
        emit CollateralOfferCreated(
            Collateral_OF_ID,
            msg.sender,
            _wantedLenderToken,
            _interest,
            _wantedLenderAmount
        );
    }

    function cancelCollateralOffer(uint256 _id) public nonReentrant() {
        CollateralOInfo memory collateralInfo = CollateralOffers[_id];
        require(collateralInfo.owner == msg.sender, "Not the owner");
        delete CollateralOffers[_id]; // Deleting info before transfering anything
        // Iterate over the collateral tokens and transfer them back to the owner
        for (uint256 i; i < collateralInfo.collateralAmount.length; i++) {
            if (collateralInfo.collaterals[i] != address(0x0)) {
                IERC20 token = IERC20(collateralInfo.collaterals[i]);
                bool success = token.transfer(
                    msg.sender,
                    collateralInfo.collateralAmount[i]
                );
                require(success);
            } else {
                (bool success, ) = msg.sender.call{
                    value: collateralInfo.collateralAmount[i]
                }("");
                require(success, "Transaction failed");
            }
        }
        emit CollateralOfferDeleted(_id, msg.sender);
    }

    /**
     * @dev Accepts a collateral offer and initiates a loan.
     * @param _id The ID of the collateral offer to accept.
     */
    function acceptCollateralOffer(uint256 _id) public payable nonReentrant() {
        CollateralOInfo memory collateralInfo = CollateralOffers[_id];
        require(
            collateralInfo.owner != address(0x0),
            "Deleted/Non-Existant Offer"
        );
        // Check if Whitelist exists and if the sender is whitelisted

        if (
            collateralInfo.whitelist.length > 0 &&
            (collateralInfo.whitelist[0] != msg.sender &&
                collateralInfo.whitelist[1] != msg.sender)
        ) {
            revert();
        }

        delete CollateralOffers[_id]; // Delete the collateral offer from the mapping

        // Send Tokens to Collateral Owner

        uint fee = (collateralInfo.wantedLenderAmount * 8) / 1000;

        if (collateralInfo.wantedLenderToken == address(0x0)) {
            require(
                msg.value >= collateralInfo.wantedLenderAmount,
                "Not Enough Ether"
            );
            (bool success, ) = collateralInfo.owner.call{
                value: collateralInfo.wantedLenderAmount - fee
            }("");
            require(success, "Transaction Error");
            (bool successAdd, ) = payable(feeAddress).call{value: fee}("");
            require(successAdd, "Transaction Error");
        } else {
            IERC20 wantedToken = IERC20(collateralInfo.wantedLenderToken);
            uint balanceBefore = wantedToken.balanceOf(collateralInfo.owner);
            bool success = wantedToken.transferFrom(
                msg.sender,
                collateralInfo.owner,
                collateralInfo.wantedLenderAmount - fee
            );
            require(success, "Error");
            uint balanceAfter = wantedToken.balanceOf(collateralInfo.owner);
            require(
                (balanceAfter - balanceBefore) ==
                    collateralInfo.wantedLenderAmount - fee,
                "Taxable Token"
            );
            bool successAdd = wantedToken.transferFrom(
                msg.sender,
                feeAddress,
                fee
            );
            require(successAdd, "Error");
        }

        // Update States & Mint NFTS (ID % 2 == 0 = 'BORROWER' && ID % 2 == 1 = 'LENDER')
        NFT_ID += 2;
        LOAN_ID++;
        Ownerships ownershipContract = Ownerships(NFT_CONTRACT);
        for (uint256 i; i < 2; i++) {
            ownershipContract.mint();
            if (i == 0) {
                ownershipContract.transferFrom(
                    address(this),
                    msg.sender,
                    NFT_ID - 1
                );
                loansByNFt[NFT_ID - 1] = LOAN_ID;
            } else {
                ownershipContract.transferFrom(
                    address(this),
                    collateralInfo.owner,
                    NFT_ID
                );
                loansByNFt[NFT_ID] = LOAN_ID;
            }
            // Transfer to new owners
        }
        // Save Loan Info
        uint256 paymentPerTime;
        if (collateralInfo.paymentCount > 0) {
            // Calculate payment per time based on payment count and interest
            paymentPerTime =
                ((collateralInfo.wantedLenderAmount /
                    collateralInfo.paymentCount) *
                    (1000 + collateralInfo.interest)) /
                1000;
        } else {
            // Calculate payment per time without payment count
            paymentPerTime = ((collateralInfo.wantedLenderAmount *
                (1000 + collateralInfo.interest)) / 1000);
        }
        // Calculate Deadline
        uint256 globalDeadline = (collateralInfo.paymentCount *
            collateralInfo.timelap) + block.timestamp;
        uint256 nextDeadline = block.timestamp + collateralInfo.timelap;

        // Save Mapping Info
        Loans[LOAN_ID] = LoanInfo({
            collateralOwnerID: NFT_ID,
            LenderOwnerId: NFT_ID - 1,
            LenderToken: collateralInfo.wantedLenderToken,
            LenderAmount: collateralInfo.wantedLenderAmount,
            collaterals: collateralInfo.collaterals,
            collateralAmount: collateralInfo.collateralAmount,
            timelap: collateralInfo.timelap,
            paymentCount: collateralInfo.paymentCount,
            paymentsPaid: 0,
            paymentAmount: paymentPerTime,
            deadline: globalDeadline,
            deadlineNext: nextDeadline,
            executed: false
        });
        emit CollateralOfferDeleted(_id, msg.sender);
        emit LoanAccepted(
            LOAN_ID,
            collateralInfo.wantedLenderToken,
            collateralInfo.collaterals
        );
    }

    function acceptLenderOffer(uint256 id) public payable nonReentrant() {
        LenderOInfo memory lenderInfo = LendersOffers[id];
        require(lenderInfo.owner != address(0x0), "Deleted/Expired Offer");
        // Check Whitelist
        if (
            lenderInfo.whitelist.length > 0 &&
            (lenderInfo.whitelist[0] != msg.sender &&
                lenderInfo.whitelist[1] != msg.sender)
        ) {
            revert();
        }

        delete LendersOffers[id];
        uint256 WEIamount;

        // Send Collaterals to this contract
        for (uint256 i; i < lenderInfo.wantedCollateralTokens.length; i++) {
            if (lenderInfo.wantedCollateralTokens[i] == address(0x0)) {
                WEIamount += lenderInfo.wantedCollateralAmount[i];
            } else {
                IERC20 wantedToken = IERC20(
                    lenderInfo.wantedCollateralTokens[i]
                );
                uint balanceBefore = wantedToken.balanceOf(address(this));
                bool success = wantedToken.transferFrom(
                    msg.sender,
                    address(this),
                    lenderInfo.wantedCollateralAmount[i]
                );
                require(success);
                uint balanceAfter = wantedToken.balanceOf(address(this));
                require(
                    (balanceAfter - balanceBefore) ==
                        lenderInfo.wantedCollateralAmount[i],
                    "Taxable Token"
                );
            }
        }

        require(msg.value >= WEIamount, "Not enough Ether");
        // Update States & Mint NFTS
        NFT_ID += 2;
        LOAN_ID++;
        Ownerships ownershipContract = Ownerships(NFT_CONTRACT);

        for (uint256 i; i < 2; i++) {
            ownershipContract.mint();
            if (i == 0) {
                ownershipContract.transferFrom(
                    address(this),
                    lenderInfo.owner,
                    NFT_ID - 1
                );
                loansByNFt[NFT_ID - 1] = LOAN_ID;
            } else {
                ownershipContract.transferFrom(
                    address(this),
                    msg.sender,
                    NFT_ID
                );
                loansByNFt[NFT_ID] = LOAN_ID;
            }
        }
        // Save Loan Info
        uint256 paymentPerTime;
        if (lenderInfo.paymentCount > 0) {
            paymentPerTime =
                ((lenderInfo.LenderAmount / lenderInfo.paymentCount) *
                    (1000 + lenderInfo.interest)) /
                1000;
        } else {
            paymentPerTime = ((lenderInfo.LenderAmount *
                (1000 + lenderInfo.interest)) / 1000);
        }
        // Calculate loan deadlines
        uint256 globalDeadline = (lenderInfo.paymentCount *
            lenderInfo.timelap) + block.timestamp;
        uint256 nextDeadline = block.timestamp + lenderInfo.timelap;
        // Store loan information in the mapping
        Loans[LOAN_ID] = LoanInfo({
            collateralOwnerID: NFT_ID,
            LenderOwnerId: NFT_ID - 1,
            LenderToken: lenderInfo.LenderToken,
            LenderAmount: lenderInfo.LenderAmount,
            collaterals: lenderInfo.wantedCollateralTokens,
            collateralAmount: lenderInfo.wantedCollateralAmount,
            timelap: lenderInfo.timelap,
            paymentCount: lenderInfo.paymentCount,
            paymentsPaid: 0,
            paymentAmount: paymentPerTime,
            deadline: globalDeadline,
            deadlineNext: nextDeadline,
            executed: false
        });
        // Send Loan to the owner of the collateral
        uint fee = (lenderInfo.LenderAmount * 8) / 1000;
        if (lenderInfo.LenderToken == address(0x0)) {
            (bool successF, ) = payable(feeAddress).call{value: fee}("");
            require(successF, "Transaction Error");
            (bool success, ) = msg.sender.call{
                value: lenderInfo.LenderAmount - fee
            }("");
            require(success, "Transaction Error");
        } else {
            IERC20 lenderToken = IERC20(lenderInfo.LenderToken);
            bool successF = lenderToken.transfer(
                msg.sender,
                lenderInfo.LenderAmount - fee
            );
            bool successFee = lenderToken.transfer(feeAddress, fee);
            require(successF);
            require(successFee);
        }

        emit LenderOfferDeleted(id, msg.sender);
        emit LoanAccepted(
            LOAN_ID,
            lenderInfo.LenderToken,
            lenderInfo.wantedCollateralTokens
        );
    }

    function payDebt(uint256 id) public payable nonReentrant() {
        LoanInfo memory loan = Loans[id];
        Ownerships ownerContract = Ownerships(NFT_CONTRACT);

        // Check conditions for valid debt payment
        // Revert the transaction if any condition fail

        // 1. Check if the loan final deadline has passed
        // 2. Check if the sender is the owner of the collateral associated with the loan
        // 3. Check if all payments have been made for the loan
        // 4. Check if the loan collateral has already been executed
        if (
            loan.deadline < block.timestamp ||
            ownerContract.ownerOf(loan.collateralOwnerID) != msg.sender ||
            loan.paymentsPaid == loan.paymentCount ||
            loan.executed == true
        ) {
            revert();
        }

        uint interestPerPayment = ((loan.paymentAmount * loan.paymentCount) - loan.LenderAmount) / loan.paymentCount;
        uint fee = (interestPerPayment * 8) / 100;

        // Increment the number of payments made
        loan.paymentsPaid += 1;
        // Update the deadline for the next payment
        loan.deadlineNext += loan.timelap;
        Loans[id] = loan;
        claimeableDebt[loan.LenderOwnerId] += loan.paymentAmount - fee;

        if (loan.LenderToken == address(0x0)) {
            require(msg.value >= loan.paymentAmount);
            (bool success, ) = payable(feeAddress).call{value: fee}("");
            require(success);
        } else {
            IERC20 lenderToken = IERC20(loan.LenderToken);
            bool success = lenderToken.transferFrom(
                msg.sender,
                address(this),
                loan.paymentAmount - fee
            );

            bool success_1 = lenderToken.transferFrom(
                feeAddress,
                address(this),
                fee
            );
            require(success_1);
            require(success);
        }
    
     
    }

    function claimCollateralasLender(uint256 id) public nonReentrant() {
        LoanInfo memory loan = Loans[id];
        Ownerships ownerContract = Ownerships(NFT_CONTRACT);
        // 1. Check if the sender is the owner of the lender's NFT
        // 2. Check if the deadline for the next payment has passed
        // 3. Check if all payments have been made for the loan
        // 4. Check if the loan has already been executed
        if (
            ownerContract.ownerOf(loan.LenderOwnerId) != msg.sender ||
            loan.deadlineNext > block.timestamp ||
            loan.paymentCount == loan.paymentsPaid ||
            loan.executed == true
        ) {
            revert();
        }
        // Mark the loan as executed
        loan.executed = true;
        Loans[id] = loan;
        uint256 WEIamount;
        uint AddWEI;
        // Iterate over the collateralTokens and collateralAmount arrays in the loan
        for (uint256 i; i < loan.collaterals.length; i++) {
            uint fee = (loan.collateralAmount[i] * 2) / 100;
            if (loan.collaterals[i] == address(0x0)) {
                // Check if the collateral token is Ether (address(0x0))
                // Sum up the collateral amount in Wei
                WEIamount += loan.collateralAmount[i] - fee;
                AddWEI += fee;
            } else {
                IERC20 token = IERC20(loan.collaterals[i]);
                bool successF = token.transfer(
                    msg.sender,
                    loan.collateralAmount[i] - fee
                );
                bool addSuccess = token.transfer(feeAddress, fee);
                require(successF);
                require(addSuccess);
            }
        }
        // Transfer the Wei amount to the lender's address
        if (WEIamount > 0) {
            (bool success, ) = msg.sender.call{value: WEIamount}("");
            require(success);
        }

        if (AddWEI > 0) {
            (bool success, ) = payable(feeAddress).call{value: AddWEI}("");
            require(success);
        }
    }

    function claimCollateralasBorrower(uint256 id) public nonReentrant() {
        LoanInfo memory loan = Loans[id];
        Ownerships ownerContract = Ownerships(NFT_CONTRACT);
        // 1. Check if the sender is the owner of the borrowers's NFT
        // 2. Check if the paymenyCount is different than the paids
        // 3. Check if the loan has already been executed
        if (
            ownerContract.ownerOf(loan.collateralOwnerID) != msg.sender ||
            loan.paymentCount != loan.paymentsPaid ||
            loan.executed == true
        ) {
            revert();
        }

        loan.executed = true;
        uint256 WEIamount;
        Loans[id] = loan;

        for (uint256 i; i < loan.collaterals.length; i++) {
            if (loan.collaterals[i] == address(0x0)) {
                WEIamount += loan.collateralAmount[i];
            } else {
                IERC20 token = IERC20(loan.collaterals[i]);
                // Transfer the Wei amount to the lender's address
                bool successF = token.transfer(
                    msg.sender,
                    loan.collateralAmount[i]
                );
                require(successF);
            }
        }
        // Transfer the Wei amount to the lender's address
        if (WEIamount > 0) {
            (bool success, ) = msg.sender.call{value: WEIamount}("");
            require(success);
        }
    }

    function claimDebt(uint id) public nonReentrant() {
        LoanInfo memory LOAN_INFO = Loans[id];
        Ownerships ownerContract = Ownerships(NFT_CONTRACT);
        uint amount = claimeableDebt[LOAN_INFO.LenderOwnerId];

        // 1. Check if the sender is the owner of the lender's NFT
        // 2. Check if there is an amount available to claim
        if (
            ownerContract.ownerOf(LOAN_INFO.LenderOwnerId) != msg.sender ||
            amount == 0
        ) {
            revert();
        }
        // Delete the claimable debt amount for the lender
        delete claimeableDebt[LOAN_INFO.LenderOwnerId];

        if (LOAN_INFO.LenderToken == address(0x0)) {
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "Transaction Failed");
        } else {
            IERC20 lenderToken = IERC20(LOAN_INFO.LenderToken);
            // Transfer the debt amount of the token to the lender's address
            bool successF = lenderToken.transfer(msg.sender, amount);
            require(successF);
        }
    }

    function setFeeaddress(address _feeAdd) public onlyFeeAdd {
        feeAddress = _feeAdd;
    }

    function setNFTContract(address _newAddress) public onlyInit {
        NFT_CONTRACT = _newAddress;
    }

    function getOfferLENDER_DATA(
        uint _id
    ) public view returns (LenderOInfo memory) {
        return LendersOffers[_id];
    }

    function getOfferCOLLATERAL_DATA(
        uint _id
    ) public view returns (CollateralOInfo memory) {
        return CollateralOffers[_id];
    }

    function getLOANS_DATA(uint _id) public view returns (LoanInfo memory) {
        return Loans[_id];
    }
}
