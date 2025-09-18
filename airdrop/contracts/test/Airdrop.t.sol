// SPDX-License-Identifier: MIT
pragma solidity 0.8.23;

import "forge-std/Test.sol";
import {Airdrop} from "../src/Airdrop.sol";
import {Verifier} from "../src/Verifier.sol";
import {IVerifier} from "../src/interface/IVerifier.sol";
import {IDepositManager} from "../src/interface/IDepositManager.sol";
import {DepositManagerMock} from "./mock/DepositManagerMock.sol";
import "@openzeppelin/token/ERC20/ERC20.sol";

// Mock ERC20 token for testing
contract MockWTON is ERC20 {
    constructor() ERC20("Wrapped TON", "WTON") {
        _mint(msg.sender, 1000000 * 10 ** 27);
    }
}

contract AirdropTest is Test {
    Airdrop public airdrop;
    MockWTON public wton;
    Verifier public verifier;
    MockVerifier public mockVerifier;
    DepositManagerMock public depositManager;

    address public owner = address(this);
    address public alice = address(0x1);
    address public bob = address(0x2);
    address public charlie = address(0x3);
    address public layer2 = address(0x4);

    bytes32 public aliceSnsId = keccak256("alice123");
    bytes32 public bobSnsId = keccak256("bob456");
    bytes32 public charlieSnsId = keccak256("charlie789");

    bytes32 public dummyProofHash = keccak256("proofHash");

    uint128[] public serializedProofPart1;
    uint256[] public serializedProofPart2;
    uint128[] public wrongSerializedProofPart1;
    uint128[] public preprocessedPart1;
    uint256[] public preprocessedPart2;
    uint256[] public validPublicInputs;
    uint256 public smax;

    Airdrop.PublicInputs ValidPublicInputs;
    Airdrop.Proof validProof;
    Airdrop.Proof wrongProof;
    Airdrop.Preprocessed validPreprocessed;

    event UserRewarded(address indexed user, bytes32 snsId, bytes32 proofHash, uint256 amount);
    event WrongProofProvided(address indexed user, bytes32 snsId, bytes32 proofHash, uint256 amount);
    event VerifierUpdated(address indexed newVerifier);
    event WinnerListUpdated(uint256 numberOfWinners);
    event BatchRewardCompleted(uint256 successfulRewards, uint256 totalRewardAmount);

    function setUp() public {
        // Deploy mock contracts
        wton = new MockWTON();
        verifier = new Verifier();
        mockVerifier = new MockVerifier();
        depositManager = new DepositManagerMock(address(wton));

        // Deploy airdrop contract
        airdrop = new Airdrop(address(wton), address(verifier), address(depositManager), layer2);

        _initializeValidProofData();
        _initializeWrongProofData();

        // Setup valid proof
        validProof = Airdrop.Proof({proof_part1: serializedProofPart1, proof_part2: serializedProofPart2});
        wrongProof = Airdrop.Proof({proof_part1: wrongSerializedProofPart1, proof_part2: serializedProofPart2});
        ValidPublicInputs = Airdrop.PublicInputs({publicInputs: validPublicInputs});

        validPreprocessed =
            Airdrop.Preprocessed({preprocessedPart1: preprocessedPart1, preprocessedPart2: preprocessedPart2});

        // Fund airdrop contract
        wton.transfer(address(airdrop), 5000 * 10 ** 27);
    }

    // Test deployment
    function testDeployment() public view {
        assertEq(address(airdrop.wton()), address(wton));
        assertEq(address(airdrop.verifier()), address(verifier));
        assertEq(address(airdrop.depositManagerProxy()), address(depositManager));
        assertEq(airdrop.owner(), owner);
        assertFalse(airdrop.airdropCompleted());
    }

    function testDeploymentWithZeroAddresses() public {
        // Test with zero token address
        vm.expectRevert("Invalid token address");
        new Airdrop(address(0), address(verifier), address(depositManager), layer2);

        // Test with zero verifier address
        vm.expectRevert("Invalid proof verifier address");
        new Airdrop(address(wton), address(0), address(depositManager), layer2);
    }

    // Test inputWinnerList
    function testInputWinnerList01() public {
        address[] memory users = new address[](2);
        users[0] = alice;
        users[1] = bob;

        bytes32[] memory snsIds = new bytes32[](2);
        snsIds[0] = aliceSnsId;
        snsIds[1] = bobSnsId;

        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](2);
        proofs[0] = validProof;
        proofs[1] = validProof;

        Airdrop.Preprocessed[] memory preprocess = new Airdrop.Preprocessed[](2);
        preprocess[0] = validPreprocessed;
        preprocess[1] = validPreprocessed;

        Airdrop.PublicInputs[] memory publicInputs = new Airdrop.PublicInputs[](2);
        publicInputs[0] = ValidPublicInputs;
        publicInputs[1] = ValidPublicInputs;

        bytes32[] memory proofHashes = new bytes32[](2);
        proofHashes[0] = dummyProofHash;
        proofHashes[1] = dummyProofHash;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 150 * 10 ** 27;
        amounts[1] = 150 * 10 ** 27;

        bool[] memory stakes = new bool[](2);
        stakes[0] = true;
        stakes[1] = false;

        vm.expectEmit(true, true, true, true);
        emit WinnerListUpdated(2);

        airdrop.inputWinnerList(users, snsIds, proofs, preprocess, publicInputs, amounts, proofHashes, stakes);

        // Verify data
        (bytes32 snsId,, uint256 amountGranted, bool isValidProof, bool hasBeenRewarded, bool stake) =
            airdrop.eligibleUser(alice);
        assertEq(snsId, aliceSnsId);
        assertFalse(hasBeenRewarded);
        assertTrue(isValidProof);
        assertTrue(stake);
        assertEq(amountGranted, 150 * 10 ** 27);

        assertEq(airdrop.getEligibleUsersCount(), 2);
        assertEq(airdrop.getEligibleUserByIndex(0), alice);
    }

    function testInputWinnerListShouldNotRevertIfWrongProof() public {
        address[] memory users = new address[](2);
        users[0] = alice;
        users[1] = bob;

        bytes32[] memory snsIds = new bytes32[](2);
        snsIds[0] = aliceSnsId;
        snsIds[1] = bobSnsId;

        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](2);
        proofs[0] = wrongProof;
        proofs[1] = validProof;

        Airdrop.Preprocessed[] memory preprocess = new Airdrop.Preprocessed[](2);
        preprocess[0] = validPreprocessed;
        preprocess[1] = validPreprocessed;

        Airdrop.PublicInputs[] memory publicInputs = new Airdrop.PublicInputs[](2);
        publicInputs[0] = ValidPublicInputs;
        publicInputs[1] = ValidPublicInputs;

        bytes32[] memory proofHashes = new bytes32[](2);
        proofHashes[0] = dummyProofHash;
        proofHashes[1] = dummyProofHash;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 150 * 10 ** 27;
        amounts[1] = 150 * 10 ** 27;

        bool[] memory stakes = new bool[](2);
        stakes[0] = true;
        stakes[1] = false;

        vm.expectEmit(true, true, true, true);
        emit WinnerListUpdated(2);

        airdrop.inputWinnerList(users, snsIds, proofs, preprocess, publicInputs, amounts, proofHashes, stakes);

        // Verify data
        (bytes32 snsId,, uint256 amountGranted, bool isValidProof, bool hasBeenRewarded, bool stake) =
            airdrop.eligibleUser(alice);
        assertEq(snsId, aliceSnsId);
        assertFalse(hasBeenRewarded);
        assertFalse(isValidProof);
        assertTrue(stake);
        assertEq(amountGranted, 150 * 10 ** 27);

        assertEq(airdrop.getEligibleUsersCount(), 2);
        assertEq(airdrop.getEligibleUserByIndex(0), alice);
    }

    function testMaximumParticipants() public {
        address[] memory users = new address[](101);
        bytes32[] memory snsIds = new bytes32[](101);
        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](101);
        Airdrop.Preprocessed[] memory preprocess = new Airdrop.Preprocessed[](101);
        Airdrop.PublicInputs[] memory publicInputs = new Airdrop.PublicInputs[](101);
        bytes32[] memory proofHashes = new bytes32[](101);
        bool[] memory stakes = new bool[](101);
        uint256[] memory amounts = new uint256[](101);

        for (uint256 i = 0; i < 51; i++) {
            users[i] = address(uint160(i + 1));
            snsIds[i] = keccak256(abi.encodePacked(i));
            proofs[i] = validProof;
            proofHashes[i] = dummyProofHash;
            stakes[i] = false;

            amounts[i] = 150 * 10 ** 27;
        }

        vm.expectRevert("maximum number of participants exceeded");
        airdrop.inputWinnerList(users, snsIds, proofs, preprocess, publicInputs, amounts, proofHashes, stakes);
    }

    // Test rewardAll
    function testrewardAll() public {
        _setupMultipleUsers();

        vm.expectEmit(true, true, true, true);
        emit UserRewarded(alice, aliceSnsId, dummyProofHash, 100 * 10 ** 27);
        vm.expectEmit(true, true, true, true);
        emit UserRewarded(bob, bobSnsId, dummyProofHash, 50 * 10 ** 27);
        vm.expectEmit(true, true, true, true);
        emit BatchRewardCompleted(2, 150 * 10 ** 27);

        airdrop.rewardAll();

        // Check balances
        assertEq(wton.balanceOf(address(depositManager)), 100 * 10 ** 27);
        assertEq(wton.balanceOf(bob), 50 * 10 ** 27);

        // Check states
        (,,, bool aliceRewarded,,) = airdrop.eligibleUser(alice);
        (,,, bool bobRewarded,,) = airdrop.eligibleUser(bob);
        assertTrue(aliceRewarded);
        assertTrue(bobRewarded);
    }

    // Test removeUser
    function testRemoveUser() public {
        _setupMultipleUsers();

        airdrop.removeUser(alice);

        // Check user is removed
        (bytes32 snsId,,,,,) = airdrop.eligibleUser(alice);
        assertEq(snsId, bytes32(0));
        assertEq(airdrop.getEligibleUsersCount(), 1);
        assertEq(airdrop.getEligibleUserByIndex(0), bob);
    }

    function testRemoveUserReverts() public {
        // User not found
        vm.expectRevert("User not found");
        airdrop.removeUser(alice);

        // User already rewarded
        _setupSingleUser(alice, aliceSnsId, 100 * 10 ** 18);
        airdrop.rewardAll();

        vm.expectRevert("Airdrop already completed");
        airdrop.removeUser(bob);
    }

    // Test airdrop completion
    function testCompleteAirdrop() public {
        assertFalse(airdrop.airdropCompleted());
        airdrop.completeAirdrop();
        assertTrue(airdrop.airdropCompleted());
    }

    function testActionsAfterCompletion() public {
        _setupSingleUser(alice, aliceSnsId, 100 * 10 ** 18);
        airdrop.completeAirdrop();

        // Cannot add new users
        address[] memory users = new address[](1);
        users[0] = bob;
        bytes32[] memory snsIds = new bytes32[](1);
        snsIds[0] = bobSnsId;
        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](1);
        proofs[0] = validProof;
        Airdrop.Preprocessed[] memory preprocess = new Airdrop.Preprocessed[](1);
        preprocess[0] = validPreprocessed;
        Airdrop.PublicInputs[] memory publicInputs = new Airdrop.PublicInputs[](1);
        publicInputs[0] = ValidPublicInputs;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 * 10 ** 18;
        bytes32[] memory proofHashes = new bytes32[](1);
        proofHashes[0] = dummyProofHash;
        bool[] memory stakes = new bool[](1);
        stakes[0] = false;

        vm.expectRevert("Airdrop event completed");
        airdrop.inputWinnerList(users, snsIds, proofs, preprocess, publicInputs, amounts, proofHashes, stakes);

        // Cannot verify and reward
        vm.expectRevert("Airdrop event completed");
        airdrop.rewardAll();

        vm.expectRevert("Airdrop event completed");
        airdrop.rewardAll();
    }

    // Test withdraw remaining tokens
    function testWithdrawRemainingTokens() public {
        _setupSingleUser(alice, aliceSnsId, 100 * 10 ** 27);
        airdrop.rewardAll();

        uint256 remainingBalance = wton.balanceOf(address(airdrop));
        uint256 ownerBalanceBefore = wton.balanceOf(owner);

        airdrop.completeAirdrop();
        airdrop.withdrawRemainingTokens();

        assertEq(wton.balanceOf(address(airdrop)), 0);
        assertEq(wton.balanceOf(owner), ownerBalanceBefore + remainingBalance);
    }

    // Test verifier update
    function testUpdateVerifier() public {
        address newVerifier = address(new Verifier());

        vm.expectEmit(true, true, true, true);
        emit VerifierUpdated(newVerifier);

        airdrop.updateVerifier(newVerifier);
        assertEq(address(airdrop.verifier()), newVerifier);
    }

    function testUpdateVerifierReverts() public {
        vm.expectRevert("Invalid verifier address");
        airdrop.updateVerifier(address(0));
    }

    function testGetRewardStats() public {
        _setupMultipleUsers();
        assertEq(airdrop.totalUserRewarded(), 0);
        airdrop.rewardAll();
        assertEq(airdrop.totalUserRewarded(), 2);
    }

    function testGetContractBalance() public view {
        assertEq(airdrop.getContractBalance(), 5000 * 10 ** 27);
    }

    // Test half reward for non-staking users
    function testHalfRewardForNonStakingUsers() public {
        // Setup one user who doesn't stake
        address[] memory users = new address[](1);
        users[0] = charlie;

        bytes32[] memory snsIds = new bytes32[](1);
        snsIds[0] = charlieSnsId;

        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](1);
        proofs[0] = validProof;

        Airdrop.Preprocessed[] memory preprocess = new Airdrop.Preprocessed[](1);
        preprocess[0] = validPreprocessed;

        Airdrop.PublicInputs[] memory publicInputs = new Airdrop.PublicInputs[](1);
        publicInputs[0] = ValidPublicInputs;

        bytes32[] memory proofHashes = new bytes32[](1);
        proofHashes[0] = dummyProofHash;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 * 10 ** 27;

        bool[] memory stakes = new bool[](1);
        stakes[0] = false;

        airdrop.inputWinnerList(users, snsIds, proofs, preprocess, publicInputs, amounts, proofHashes, stakes);

        uint256 charlieBalanceBefore = wton.balanceOf(charlie);

        // Should emit event with half the granted amount (50 * 10^27 instead of 100 * 10^27)
        vm.expectEmit(true, true, true, true);
        emit UserRewarded(charlie, charlieSnsId, dummyProofHash, 50 * 10 ** 27);

        airdrop.rewardAll();

        // Charlie should receive half of granted amount since not staking
        assertEq(wton.balanceOf(charlie), charlieBalanceBefore + 50 * 10 ** 27);
        
        // Check total distributed is half the granted amount
        assertEq(airdrop.totalAmountDistributed(), 50 * 10 ** 27);
    }

    // Test full reward for staking users
    function testFullRewardForStakingUsers() public {
        // Setup one user who stakes
        address[] memory users = new address[](1);
        users[0] = charlie;

        bytes32[] memory snsIds = new bytes32[](1);
        snsIds[0] = charlieSnsId;

        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](1);
        proofs[0] = validProof;

        Airdrop.Preprocessed[] memory preprocess = new Airdrop.Preprocessed[](1);
        preprocess[0] = validPreprocessed;

        Airdrop.PublicInputs[] memory publicInputs = new Airdrop.PublicInputs[](1);
        publicInputs[0] = ValidPublicInputs;

        bytes32[] memory proofHashes = new bytes32[](1);
        proofHashes[0] = dummyProofHash;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100 * 10 ** 27;

        bool[] memory stakes = new bool[](1);
        stakes[0] = true;

        airdrop.inputWinnerList(users, snsIds, proofs, preprocess, publicInputs, amounts, proofHashes, stakes);

        uint256 depositManagerBalanceBefore = wton.balanceOf(address(depositManager));

        // Should emit event with full granted amount
        vm.expectEmit(true, true, true, true);
        emit UserRewarded(charlie, charlieSnsId, dummyProofHash, 100 * 10 ** 27);

        airdrop.rewardAll();

        // Deposit manager should receive full amount since user is staking
        assertEq(wton.balanceOf(address(depositManager)), depositManagerBalanceBefore + 100 * 10 ** 27);
        
        // Check total distributed is full granted amount
        assertEq(airdrop.totalAmountDistributed(), 100 * 10 ** 27);
    }

    // Helper functions
    function _setupSingleUser(address user, bytes32 snsId, uint256 amount) private {
        address[] memory users = new address[](1);
        users[0] = user;

        bytes32[] memory snsIds = new bytes32[](1);
        snsIds[0] = snsId;

        bytes32[] memory proofHashes = new bytes32[](1);
        proofHashes[0] = dummyProofHash;

        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](1);
        proofs[0] = validProof;

        Airdrop.Preprocessed[] memory preprocess = new Airdrop.Preprocessed[](1);
        preprocess[0] = validPreprocessed;

        Airdrop.PublicInputs[] memory publicInputs = new Airdrop.PublicInputs[](1);
        publicInputs[0] = ValidPublicInputs;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = amount;

        bool[] memory stakes = new bool[](1);
        stakes[0] = false;

        airdrop.inputWinnerList(users, snsIds, proofs, preprocess, publicInputs, amounts, proofHashes, stakes);
    }

    function _setupMultipleUsers() private {
        address[] memory users = new address[](2);
        users[0] = alice;
        users[1] = bob;

        bytes32[] memory snsIds = new bytes32[](2);
        snsIds[0] = aliceSnsId;
        snsIds[1] = bobSnsId;

        bytes32[] memory proofHashes = new bytes32[](2);
        proofHashes[0] = dummyProofHash;
        proofHashes[1] = dummyProofHash;

        Airdrop.Proof[] memory proofs = new Airdrop.Proof[](2);
        proofs[0] = validProof;
        proofs[1] = validProof;

        Airdrop.Preprocessed[] memory preprocess = new Airdrop.Preprocessed[](2);
        preprocess[0] = validPreprocessed;
        preprocess[1] = validPreprocessed;

        Airdrop.PublicInputs[] memory publicInputs = new Airdrop.PublicInputs[](2);
        publicInputs[0] = ValidPublicInputs;
        publicInputs[1] = ValidPublicInputs;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100 * 10 ** 27;
        amounts[1] = 100 * 10 ** 27;

        bool[] memory stakes = new bool[](2);
        stakes[0] = true;
        stakes[1] = false;

        airdrop.inputWinnerList(users, snsIds, proofs, preprocess, publicInputs, amounts, proofHashes, stakes);
    }

    function _initializeValidProofData() internal {
        // serializedProofPart1: First 16 bytes (32 hex chars) of each coordinate
        // serializedProofPart2: Last 32 bytes (64 hex chars) of each coordinate
        // preprocessedPart1: First 16 bytes (32 hex chars) of each preprocessed committment coordinate
        // preprocessedPart2: last 32 bytes (64 hex chars) of each preprocessed committment coordinate


        // PREPROCESSED PART 1 (First 16 bytes - 32 hex chars)
        preprocessedPart1.push(0x1186b2f2b6871713b10bc24ef04a9a39);
        preprocessedPart1.push(0x02b36b71d4948be739d14bb0e8f4a887);
        preprocessedPart1.push(0x18e54aba379045c9f5c18d8aefeaa8cc);
        preprocessedPart1.push(0x08df3e052d4b1c0840d73edcea3f85e7);

        // PREPROCESSED PART 2 (Last 32 bytes - 64 hex chars)
        preprocessedPart2.push(0x7e084b3358f7f1404f0a4ee1acc6d254997032f77fd77593fab7c896b7cfce1e);
        preprocessedPart2.push(0xe2dfa30cd1fca5558bfe26343dc755a0a52ef6115b9aef97d71b047ed5d830c8);
        preprocessedPart2.push(0xf68408df0b8dda3f529522a67be22f2934970885243a9d2cf17d140f2ac1bb10);
        preprocessedPart2.push(0x4b0d9a6ffeb25101ff57e35d7e527f2080c460edc122f2480f8313555a71d3ac);


        // SERIALIZED PROOF PART 1 (First 16 bytes - 32 hex chars)
        serializedProofPart1.push(0x1236d4364cc024d1bb70d584096fae2c);
        serializedProofPart1.push(0x14caedc95bee5309da79cfe59aa67ba3);
        serializedProofPart1.push(0x0573b8e1fe407ab0e47f7677b3333c8b);
        serializedProofPart1.push(0x0b4a0b22cbea8b0e92c90d65f2d2eb57);
        serializedProofPart1.push(0x0f05d6f9f8d90891c0d9885d5a8b3dce);
        serializedProofPart1.push(0x091d21a7b62e312796931eb6ba0cc810);
        serializedProofPart1.push(0x0c1c9f2b440618cd80ffc68a14559aac);
        serializedProofPart1.push(0x197314b7857dd5fbad45dbf34878d675);
        serializedProofPart1.push(0x03b4e9b71f05081b59bf9e1112e5a667);
        serializedProofPart1.push(0x0b30a9b1c509db26df1a299e56e62272);
        serializedProofPart1.push(0x04fffae927d7a9d9914e42203aa03692);
        serializedProofPart1.push(0x0185be457591c9c6b11c106add9d62be);
        serializedProofPart1.push(0x090303ab1724b71758062ff4dc2c1da0);
        serializedProofPart1.push(0x026da799b5c02de6229060e0bed5ece5);
        serializedProofPart1.push(0x09781600275ede5c4b5a2db154bd142c);
        serializedProofPart1.push(0x105346c772199060310f36313d15e5ba);
        serializedProofPart1.push(0x0ef5d60c26871f94e1b9d172c2ba0e9d);
        serializedProofPart1.push(0x098d4e8655cdc6819deb56aef2ff42aa);
        serializedProofPart1.push(0x0cd2cdadbe300634208a30bbfc88bdb3);
        serializedProofPart1.push(0x199cf445ad58377b94b3430c9c597750);
        serializedProofPart1.push(0x15520ed9c503f7fe6bfed55e60091b23);
        serializedProofPart1.push(0x0858cbc81ce8bdb7876efc9b7225d253);
        serializedProofPart1.push(0x135d4abaa1e96b2c41e511da50746d1e);
        serializedProofPart1.push(0x1470193b3bccc9a821d10281bc154777);
        serializedProofPart1.push(0x0ae7ec720fb7ff80618a1e1bedc505cc);
        serializedProofPart1.push(0x0d337319259f04c8c6c14231a58f77fb);
        serializedProofPart1.push(0x003d23310314e9d975c46f56ad439311);
        serializedProofPart1.push(0x0ed9b1cea085ae4f0ed7245153d44351);
        serializedProofPart1.push(0x13579a09b2ae2900f0237521524a6e9c);
        serializedProofPart1.push(0x0c76da67f3808d851385caf2e3dc2cfa);
        serializedProofPart1.push(0x0a36eb8c4c918ea3356bc740ad117a43);
        serializedProofPart1.push(0x15fa53d71a9d682982ee27b4abe0bc96);
        serializedProofPart1.push(0x13579a09b2ae2900f0237521524a6e9c);
        serializedProofPart1.push(0x0c76da67f3808d851385caf2e3dc2cfa);
        serializedProofPart1.push(0x0f028db2a0e1048fd5b47d7598b0e5cd);
        serializedProofPart1.push(0x0f776ce8b238fc163c0b1aa8113d0908);
        serializedProofPart1.push(0x004fd73b11ac3d8956b72d5b0d6093b1);
        serializedProofPart1.push(0x081eb0d1bd168c6d30235d758caa900f);

        // SERIALIZED PROOF PART 2 (Last 32 bytes - 64 hex chars)
        serializedProofPart2.push(0xd107861dd8cac07bc427c136bc12f424521b3e3aaab440fdcdd66a902e22c0a4);
        serializedProofPart2.push(0x27d4a95a71f8b939514a0e455984f5c90b9fdcf5702a3da9a8d73f7f93292c23);
        serializedProofPart2.push(0x08393216d4961ef999d5938af832fd08b8ff691f4a25cd77786485e9891e2389);
        serializedProofPart2.push(0x497128bfba07e0f4244381c1700d6077598a28d1be5dae2a8e39fa6bd93000eb);
        serializedProofPart2.push(0x21d37a6c1f275d5192cfae389ec36af3257e746b3436589937f9bf16951c96a3);
        serializedProofPart2.push(0xbd49edca77d31e9fb7e8409a7409de741291698c0616967dcd7df1f5f34f6212);
        serializedProofPart2.push(0xf8a09978de0b6da6a9adc14ae826a5f05ee59b8ef17cfc26f93a104a664772e4);
        serializedProofPart2.push(0x1e214b4474e3e3b12789687f6bb6aa21df83b8434c49503bb929e8776e25869a);
        serializedProofPart2.push(0x4827419fee6540682017f10cd025c5f529a538ae600e3da543df57f25c85410f);
        serializedProofPart2.push(0x689880618d70f83eb0327c25608b48e750683430af117c0794d1ea7d4c05d295);
        serializedProofPart2.push(0x2836b43a9e6186487d363806eef564668eea8450dd58003abb4493d03bb239dd);
        serializedProofPart2.push(0x5784ab6a90aeb6fc6902b8d1ec1333ebf7e47f5c878eed1760843022a12a0727);
        serializedProofPart2.push(0xe688f506550d58aabd9be1051f4c42e928daa3bff57d2ebbd51bcd8be9b8e6b5);
        serializedProofPart2.push(0x2d268da230515168ffe241f350b12b6327dbea40126a0bc42629d047bdd13899);
        serializedProofPart2.push(0x6ec471068192170ecba808f5e99d94fd0729aff5fa411259b8d0d15dc9014658);
        serializedProofPart2.push(0x1357efc6c11cecf08c707228c6ac1b7a085e58ec52fb0468e3d2c60c4e2f6d23);
        serializedProofPart2.push(0x9788ba6df5cd36366e117ee97617b9cbdbfdb6eb8d1992b466767c6054e0150b);
        serializedProofPart2.push(0x5bb7a72c58d95800908e97c120ea98d22dce8893be18c43141b395a1071435ff);
        serializedProofPart2.push(0x7b90461c75d2910f36ce7b0aa1ad2343ba3981a4f272bedd13ce7e6952464f7c);
        serializedProofPart2.push(0xf68adfcea0d40e2a213e9c79208868f3e1989bbd6c3b9fdcc8eadc01d8a27e9f);
        serializedProofPart2.push(0xeab4846d491d118102a4ed96b1f24e5561ba10b3da8d683ed4ce44101e43c90d);
        serializedProofPart2.push(0x0e63557fb84b1d30339c9887f73d25c36f4242f35f9f581c473c82771e1f02e6);
        serializedProofPart2.push(0x4a155e92ca9b3a04afd3d444144bc3fd159d8c59fc5b3818d4f6ef32b0a954d9);
        serializedProofPart2.push(0xc041580ce190738da7afed0950af2564dd4a1b37a00cee090693a6a51868ae05);
        serializedProofPart2.push(0xb694bced949e4bfa188aaafaff65104501baea71861641881912533fef4e8686);
        serializedProofPart2.push(0xd33831c8ac7db381c8d9b1794bcfb57e472233dacef7c772b7c341c25ea934a4);
        serializedProofPart2.push(0x9182967105641eb087fb623c18d123574ef7b607d9f0ecf482ba80f8956d5bba);
        serializedProofPart2.push(0x53c804d5c258cb2ccbef3b7ae770df1959f5e573e134549ad269bd0e0e48fb3b);
        serializedProofPart2.push(0x922902030906773420f0a580e9cd488ae85c6569af6aebf3fcfd4f7b5ca8cdef);
        serializedProofPart2.push(0x19f360efa956bff46082f20b08e0d8298d8f630b6e58ca4da38113e2da32c0ee);
        serializedProofPart2.push(0xedea4fc1fa3627585cb54ac465ebabf4800ef8eb883ac267b382ff16b4af00aa);
        serializedProofPart2.push(0x10614258c22d18a6d52790e267c11b6dc6c7c38121322590df3f8fa3ca048e0b);
        serializedProofPart2.push(0x922902030906773420f0a580e9cd488ae85c6569af6aebf3fcfd4f7b5ca8cdef);
        serializedProofPart2.push(0x19f360efa956bff46082f20b08e0d8298d8f630b6e58ca4da38113e2da32c0ee);
        serializedProofPart2.push(0x33f065ca773908e0413e0797833584d46117ec49d309e4029b6b721637d01b3f);
        serializedProofPart2.push(0x3d58946048c0a8069237279ab514c6668679e47d403ff97ffdd0f28324216a35);
        serializedProofPart2.push(0xb89db416a80924c391ac012c1090ee4a91a1c5b1ecee12b992be5421190f3b6e);
        serializedProofPart2.push(0x7666a2dd1ec1bdd49e18df33d671ee4a7b22a5cb861df2d50bcd69fe2332b2a4);
        serializedProofPart2.push(0x14fd3c88e1cda3469c81fae671cf5ff501f5e671c9d6f537763f168b8a4c0a13);
        serializedProofPart2.push(0x67e12eb4b5beb06f83dcba323de6a3e366c307edc2a869f0930138da26a5fc48);
        serializedProofPart2.push(0x046accff92294fc236fcc0182d158388d53a75a1f4d5fe75c17f13a59aed9f06);
        serializedProofPart2.push(0x49fe17d694f683e5b941fe406857e2527b16573bd693d3e8b1125d20f480e987);
        

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////             PUBLIC INPUTS             ////////////////////////////////////////////////
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        validPublicInputs.push(0x00000000000000000000000000000000d9bb52200d942752f44a41d658ee82de);
        validPublicInputs.push(0x00000000000000000000000000000000000000000000000000000000cfc387b2);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x00000000000000000000000000000000d9bb52200d942752f44a41d658ee82de);
        validPublicInputs.push(0x00000000000000000000000000000000000000000000000000000000cfc387b2);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000049238da5803c4d4348d4b9e8fa15ef77);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000039921773);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000049238da5803c4d4348d4b9e8fa15ef77);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000039921773);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x00000000000000000000000000000000c96fb81fd761249696c372ec513d9e37);
        validPublicInputs.push(0x00000000000000000000000000000000f4b8e02bbf4c61201ef9f213934d9b3f);
        validPublicInputs.push(0x00000000000000000000000000000000c96fb81fd761249696c372ec513d9e37);
        validPublicInputs.push(0x00000000000000000000000000000000f4b8e02bbf4c61201ef9f213934d9b3f);
        validPublicInputs.push(0x00000000000000000000000000000000a769b91007adaa1fab75629d82eae4c2);
        validPublicInputs.push(0x0000000000000000000000000000000011cecbbf11187acad2789e79c034b854);
        validPublicInputs.push(0x00000000000000000000000000000000a769b91007adaa1fab75629d82eae4c2);
        validPublicInputs.push(0x0000000000000000000000000000000011cecbbf11187acad2789e79c034b854);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);
        validPublicInputs.push(0x0000000000000000000000000000000000000000000000000000000000000000);

        smax = 512;
        
    }

    function _initializeWrongProofData() internal {
        // serializedProofPart1: First 16 bytes (32 hex chars) of each coordinate
        // SERIALIZED PROOF PART 1 (First 16 bytes - 32 hex chars)
        wrongSerializedProofPart1.push(0x05b4f308ff64132b31b740431cee5d70); // U_X
        wrongSerializedProofPart1.push(0x12ae9a8d3ec9c65c98664e311e634d64); // U_Y
        wrongSerializedProofPart1.push(0x08e6d6c1e6691e932692e3942a6cbef7); // V_X
        wrongSerializedProofPart1.push(0x12cdafbf7bf8b80338459969b4c54bcb); // V_Y
        wrongSerializedProofPart1.push(0x0c2fe4549b4508fa6db64b438661f36c); // W_X
        wrongSerializedProofPart1.push(0x00ba5ce79b6c3ee1f9325076cd019f51); // W_Y
        wrongSerializedProofPart1.push(0x10d2a2a6b5d9b0f74e5ca7207cbb10b2); // O_mid_X
        wrongSerializedProofPart1.push(0x143fc4f52ca987f2e47a85310ca5693b); // O_mid_Y
        wrongSerializedProofPart1.push(0x0d0d110f829d162dc4e1e76a7544188b); // O_prv_X
        wrongSerializedProofPart1.push(0x01c43cc10d4ec71dd398bcdbbd6f8eb7); // O_prv_Y
        wrongSerializedProofPart1.push(0x180d963ee9bd02f3e93f7614105c95f3); // Q_{AX}_X
        wrongSerializedProofPart1.push(0x13efcb0e014478ce79000206e8b39ea5); // Q_{AX}_Y
        wrongSerializedProofPart1.push(0x0bc733812b8bba788f2f4fff4751f70d); // Q_{AY}_X
        wrongSerializedProofPart1.push(0x0afb2ae78cb743b453858f07e92b466a); // Q_{AY}_Y
        wrongSerializedProofPart1.push(0x04897b34fcba759c43efbe8834f279b3); // Q_{CX}_X
        wrongSerializedProofPart1.push(0x0af44a63032292984463891d0c1555ee); // Q_{CX}_Y
        wrongSerializedProofPart1.push(0x12e0faf1eaaca9e9e0f3be64eb013c9d); // Q_{CY}_X
        wrongSerializedProofPart1.push(0x151e4f845009fdef5cf50bde3c38d42c); // Q_{CY}_Y
        wrongSerializedProofPart1.push(0x07ec505b12d1d7337382721371829fa1); // Π_{χ}_X
        wrongSerializedProofPart1.push(0x167afb06ffb4c89b5e04a598139f20f0); // Π_{χ}_Y
        wrongSerializedProofPart1.push(0x09468040e794eaa40c964c3b8f4fa252); // Π_{ζ}_X
        wrongSerializedProofPart1.push(0x1395d5b79c0a1e3915974a4899d5b00b); // Π_{ζ}_Y
        wrongSerializedProofPart1.push(0x07ba876a95322207b596d39ed0490997); // B_X
        wrongSerializedProofPart1.push(0x13adce13779790b3bfbee74b54bfa42b); // B_Y
        wrongSerializedProofPart1.push(0x0516cebd5e7b3d9eca97a4959737c8af); // R_X
        wrongSerializedProofPart1.push(0x18d3891d0f746a6e4de8d9f0973c55f3); // R_Y
        wrongSerializedProofPart1.push(0x16911127fce9f466f95506edd9eae5ff); // M_ζ_X (M_Y_X)
        wrongSerializedProofPart1.push(0x05438bddfb750e22c41a713494c7c5e9); // M_ζ_Y (M_Y_Y)
        wrongSerializedProofPart1.push(0x0ac8be4b1cb6a9c8354fcf35e5d7a339); // M_χ_X (M_X_X)
        wrongSerializedProofPart1.push(0x16695706d77185cdfdad3d70e8d73e87); // M_χ_Y (M_X_Y)
        wrongSerializedProofPart1.push(0x172dfe9a0767dda975f5fbde45ed1ae0); // N_ζ_X (N_Y_X)
        wrongSerializedProofPart1.push(0x17b91c24ec6ce0e74426041d668c329a); // N_ζ_Y (N_Y_Y)
        wrongSerializedProofPart1.push(0x0ac8be4b1cb6a9c8354fcf35e5d7a339); // N_χ_X (N_X_X)
        wrongSerializedProofPart1.push(0x16695706d77185cdfdad3d70e8d73e87); // N_χ_Y (N_X_Y)
        wrongSerializedProofPart1.push(0x0883ed3c97b3e674ebfc683481742daa); // O_pub_X
        wrongSerializedProofPart1.push(0x0f697de543d92f067e8ff95912513e49); // O_pub_Y
        wrongSerializedProofPart1.push(0x097d7a0fe6430f3dfe4e10c2db6ec878); // A_X
        wrongSerializedProofPart1.push(0x104de32201c5ba649cc17df4cf759a1f); // A_Y

        smax = 64;
    }
}

// Mock Verifier contract
contract MockVerifier is IVerifier {
    bool public shouldVerify = false;

    function verify(uint128[] memory, uint256[] memory, uint128[] memory, uint256[] memory, uint256[] memory, uint256)
        external
        view
        returns (bool)
    {
        return shouldVerify;
    }
}
