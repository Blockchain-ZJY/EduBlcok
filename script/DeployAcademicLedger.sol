// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {AcademicLedger} from "../src/AcademicLedger.sol";

contract DeployAcademicLedger is Script {
    function run() external returns (AcademicLedger) {
        vm.startBroadcast();
        AcademicLedger academicLedger = new AcademicLedger();
        vm.stopBroadcast();
        return academicLedger;
    }
}
