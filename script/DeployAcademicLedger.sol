// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {AcademicLedger} from "../src/AcademicLedger.sol";
import {console} from "forge-std/console.sol";

contract DeployAcademicLedger is Script {
    function run() external returns (AcademicLedger) {
        console.log("\n========================================");
        console.log("Deploying AcademicLedger Contract...");
        console.log("========================================\n");
        
        vm.startBroadcast();
        AcademicLedger academicLedger = new AcademicLedger();
        vm.stopBroadcast();
        
        console.log("\n========================================");
        console.log("     Deployment Successful!");
        console.log("========================================");
        console.log("Contract Address:", address(academicLedger));
        console.log("Network: Polkadot Asset Hub Testnet");
        console.log("========================================\n");
        
        // 提示用户更新前端配置
        console.log("[NEXT STEP]");
        console.log("Update CONTRACT_ADDRESS in:");
        console.log("academic-ledger-frontend/src/contracts/AcademicLedger.ts");
        console.log("\nNew address:", address(academicLedger));
        console.log("========================================\n");
        
        return academicLedger;
    }
}
