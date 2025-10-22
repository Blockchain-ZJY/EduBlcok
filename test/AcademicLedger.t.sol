// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {AcademicLedger} from "../src/AcademicLedger.sol"; // 确保路径正确

/**
 * @title Test for AcademicLedger contract
 * @dev This contract tests all major functionalities of the AcademicLedger,
 * including role management, institution registration, certificate issuance,
 * revocation, and verification.
 */
contract AcademicLedgerTest is Test {
    // 合约实例
    AcademicLedger public academicLedger;

    // 角色与地址定义
    address public admin;
    address public institution;
    address public student;
    address public anotherUser;

    // 常量
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");

    // 事件签名，用于 `vm.expectEmit`
    event InstitutionRegistered(address indexed institution, string name, string metadataURI);
    event InstitutionStatusChanged(address indexed institution, bool active);
    event CertificateIssued(
        uint256 indexed id,
        address indexed student,
        address indexed institution,
        bytes32 docHash
    );
    event CertificateRevoked(uint256 indexed id, address indexed institution, string reason);
    event CertificateUriUpdated(uint256 indexed id, string newUri);

    /**
     * @dev 设置测试环境：部署合约并初始化角色地址。
     *      此函数在每个测试用例（以 `test` 开头的函数）运行前都会被调用。
     */
    function setUp() public {
        // 1. 创建用户地址
        admin = makeAddr("admin");
        institution = makeAddr("institution");
        student = makeAddr("student");
        anotherUser = makeAddr("anotherUser");

        // 2. 部署合约，并将 `admin` 设置为合约的部署者
        vm.prank(admin);
        academicLedger = new AcademicLedger();
    }

    // ---------------------------
    // 1. 部署与初始化测试
    // ---------------------------

    function test_InitialState() public {
        assertTrue(academicLedger.hasRole(academicLedger.DEFAULT_ADMIN_ROLE(), admin), "Admin role not set");
    }

    // ---------------------------
    // 2. 院校管理测试
    // ---------------------------

    function test_AdminCanRegisterInstitution() public {
        vm.prank(admin);
        vm.expectEmit(true, true, false, true);
        emit InstitutionRegistered(institution, "Test University", "ipfs://meta_inst");
        academicLedger.registerInstitution(institution, "Test University", "ipfs://meta_inst");

        assertTrue(academicLedger.hasRole(INSTITUTION_ROLE, institution), "Institution role not granted");
        
        // --- FIX START ---
        // 正确地接收多个返回值
        (string memory name, , bool active) = academicLedger.institutions(institution);
        assertEq(name, "Test University");
        assertTrue(active, "Institution should be active");
        // --- FIX END ---
    }

    function test_Fail_NonAdminCannotRegisterInstitution() public {
        vm.prank(anotherUser);
        vm.expectRevert(); // 预期会因权限不足而回滚
        academicLedger.registerInstitution(institution, "Test University", "ipfs://meta_inst");
    }

    function test_AdminCanSetInstitutionStatus() public {
        // 先注册
        vm.prank(admin);
        academicLedger.registerInstitution(institution, "Test University", "ipfs://meta_inst");

        // 停用
        vm.prank(admin);
        vm.expectEmit(true, false, false, true);
        emit InstitutionStatusChanged(institution, false);
        academicLedger.setInstitutionStatus(institution, false);
        
        // --- FIX START ---
        // 先获取状态值，再断言
        (, , bool active) = academicLedger.institutions(institution);
        assertFalse(active, "Institution should be inactive");
        // --- FIX END ---

        // 再次启用
        vm.prank(admin);
        vm.expectEmit(true, false, false, true);
        emit InstitutionStatusChanged(institution, true);
        academicLedger.setInstitutionStatus(institution, true);
        
        // --- FIX START ---
        // 再次获取状态值，再断言
        (, , active) = academicLedger.institutions(institution);
        assertTrue(active, "Institution should be active again");
        // --- FIX END ---
    }

    function test_Fail_NonAdminCannotSetStatus() public {
        vm.prank(admin);
        academicLedger.registerInstitution(institution, "Test University", "ipfs://meta_inst");

        vm.prank(anotherUser);
        vm.expectRevert();
        academicLedger.setInstitutionStatus(institution, false);
    }

    // ---------------------------
    // 3. 证书签发测试 (这部分没有问题，无需修改)
    // ---------------------------

    function test_InstitutionCanIssueCertificate() public {
        vm.prank(admin);
        academicLedger.registerInstitution(institution, "Test University", "ipfs://meta_inst");

        bytes32 docHash = keccak256("PDF_CONTENT");
        vm.prank(institution);
        vm.expectEmit(true, true, true, true);
        emit CertificateIssued(1, student, institution, docHash);
        uint256 certId = academicLedger.issueCertificate(
            student, "Computer Science", "Bachelor", 0, "ipfs://cert_details", docHash
        );

        assertEq(certId, 1, "Certificate ID should be 1");
        AcademicLedger.Certificate memory cert = academicLedger.getCertificate(certId);
        assertEq(cert.student, student);
        assertEq(cert.institution, institution);
        assertEq(cert.program, "Computer Science");
        assertFalse(cert.revoked, "Certificate should not be revoked");

        uint256[] memory studentCerts = academicLedger.certificatesOf(student);
        assertEq(studentCerts.length, 1);
        assertEq(studentCerts[0], certId);
    }

    function test_Fail_InactiveInstitutionCannotIssue() public {
        vm.prank(admin);
        academicLedger.registerInstitution(institution, "Test University", "ipfs://meta_inst");
        academicLedger.setInstitutionStatus(institution, false);

        vm.prank(institution);
        vm.expectRevert("Institution inactive");
        academicLedger.issueCertificate(student, "CS", "BS", 0, "uri", keccak256("doc"));
    }

    function test_Fail_NonInstitutionCannotIssue() public {
        vm.prank(anotherUser);
        vm.expectRevert();
        academicLedger.issueCertificate(student, "CS", "BS", 0, "uri", keccak256("doc"));
    }
    
    // ---------------------------
    // 4. 证书管理测试 (这部分没有问题，无需修改)
    // ---------------------------

    function test_IssuerCanRevokeCertificate() public {
        vm.prank(admin);
        academicLedger.registerInstitution(institution, "Test University", "ipfs://meta_inst");
        vm.prank(institution);
        uint256 certId = academicLedger.issueCertificate(student, "CS", "BS", 0, "uri", keccak256("doc"));
    
        string memory reason = "Academic misconduct";
        vm.prank(institution);
        vm.expectEmit(true, true, false, true);
        emit CertificateRevoked(certId, institution, reason);
        academicLedger.revokeCertificate(certId, reason);

        AcademicLedger.Certificate memory cert = academicLedger.getCertificate(certId);
        assertTrue(cert.revoked, "Certificate should be revoked");

        (bool isValid, ) = academicLedger.verifyValidity(certId);
        assertFalse(isValid, "Revoked certificate should be invalid");
    }

    function test_Fail_NonIssuerCannotRevoke() public {
        vm.prank(admin);
        academicLedger.registerInstitution(institution, "Test University", "ipfs://meta_inst");
        vm.prank(institution);
        uint256 certId = academicLedger.issueCertificate(student, "CS", "BS", 0, "uri", keccak256("doc"));

        vm.prank(anotherUser);
        vm.expectRevert("Not issuer");
        academicLedger.revokeCertificate(certId, "Trying to hack");
    }

    function test_IssuerCanUpdateUri() public {
        vm.prank(admin);
        academicLedger.registerInstitution(institution, "Test University", "ipfs://meta_inst");
        vm.prank(institution);
        uint256 certId = academicLedger.issueCertificate(student, "CS", "BS", 0, "uri_old", keccak256("doc"));

        string memory newUri = "ipfs://new_uri";
        vm.prank(institution);
        vm.expectEmit(true, false, false, true);
        emit CertificateUriUpdated(certId, newUri);
        academicLedger.updateCertificateUri(certId, newUri);

        AcademicLedger.Certificate memory cert = academicLedger.getCertificate(certId);
        assertEq(cert.uri, newUri, "URI should be updated");
    }

    // ---------------------------
    // 5. 暂停功能测试 (这部分没有问题，无需修改)
    // ---------------------------

    function test_Pausable() public {
        vm.prank(admin);
        academicLedger.registerInstitution(institution, "Test University", "ipfs://meta_inst");
    
        vm.prank(admin);
        academicLedger.pause();
        assertTrue(academicLedger.paused(), "Contract should be paused");

        vm.prank(institution);
        vm.expectRevert("Pausable: paused");
        academicLedger.issueCertificate(student, "CS", "BS", 0, "uri", keccak256("doc"));

        vm.prank(admin);
        academicLedger.unpause();
        assertFalse(academicLedger.paused(), "Contract should be unpaused");

        vm.prank(institution);
        uint256 certId = academicLedger.issueCertificate(student, "CS", "BS", 0, "uri", keccak256("doc"));
        assertEq(certId, 1);
    }

    // ---------------------------
    // 6. 验证逻辑测试 (这部分没有问题，无需修改)
    // ---------------------------

    function test_VerifyValidity() public {
        vm.prank(admin);
        academicLedger.registerInstitution(institution, "Test University", "ipfs://meta_inst");
        vm.prank(institution);
        
        uint256 validCertId = academicLedger.issueCertificate(student, "CS", "BS", 0, "uri", keccak256("doc1"));
        (bool isValid, string memory reason) = academicLedger.verifyValidity(validCertId);
        assertTrue(isValid, "Should be valid");
        assertEq(reason, "", "Reason should be empty for valid cert");

        uint256 revokedCertId = academicLedger.issueCertificate(student, "Math", "MS", 0, "uri", keccak256("doc2"));
        academicLedger.revokeCertificate(revokedCertId, "revoked");
        (isValid, reason) = academicLedger.verifyValidity(revokedCertId);
        assertFalse(isValid, "Should be invalid (revoked)");
        assertEq(reason, "Revoked");
        
        uint64 pastTimestamp = uint64(block.timestamp - 1 days);
        uint256 expiredCertId = academicLedger.issueCertificate(student, "Phys", "PhD", pastTimestamp, "uri", keccak256("doc3"));
        (isValid, reason) = academicLedger.verifyValidity(expiredCertId);
        assertFalse(isValid, "Should be invalid (expired)");
        assertEq(reason, "Expired");
        
        uint256 instInactiveCertId = academicLedger.issueCertificate(student, "Chem", "BS", 0, "uri", keccak256("doc4"));
        vm.prank(admin);
        academicLedger.setInstitutionStatus(institution, false);
        (isValid, reason) = academicLedger.verifyValidity(instInactiveCertId);
        assertFalse(isValid, "Should be invalid (institution inactive)");
        assertEq(reason, "Institution inactive");
        
        (isValid, reason) = academicLedger.verifyValidity(999);
        assertFalse(isValid, "Should be invalid (not found)");
        assertEq(reason, "Not found");
    }
}