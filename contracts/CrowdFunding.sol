// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CrowdFunding is Ownable {
    address public tokenOwner;
    mapping(address => uint) public contributions;
    uint public targetAmount;
    uint public deadline;
    bool public ended;
    uint public numContributors;
    uint public amountRaised;

    // 1 ether can buy 10000 tokens
    uint public constant exchangeRate = 10000;

    // Crowd Token
    address public crowdToken;

    constructor(
        uint _targetAmount,
        uint _duration,
        address _crowdToken
    ) Ownable(msg.sender) {
        tokenOwner = msg.sender;
        targetAmount = _targetAmount;
        deadline = block.timestamp + _duration;
        ended = false;
        amountRaised = 0;
        crowdToken = _crowdToken;
    }

    function contribute() public payable {
        require(!ended, "The crowdfunding has ended");
        require(block.timestamp < deadline, "The deadline has been reached");
        require(
            amountRaised + msg.value <= targetAmount,
            "The contribution exceeds the target"
        );

        IERC20(crowdToken).transferFrom(
            tokenOwner,
            msg.sender,
            msg.value * exchangeRate
        );

        contributions[msg.sender] += msg.value;
        amountRaised += msg.value;
        if (amountRaised == targetAmount) {
            ended = true;
        }
    }

    function checkGoalReached() public onlyOwner {
        require(!ended, "The crowdfunding has ended");
        require(
            block.timestamp >= deadline,
            "The deadline has not been reached yet"
        );
        if (block.timestamp >= deadline) {
            ended = true;
        }
    }

    function withdraw() external {
        require(ended, "The crowdfunding has not ended yet");
        if (amountRaised == targetAmount) {
            // Transfer the funds to the owner
            payable(tokenOwner).transfer(amountRaised);
        } else {
            address funder = msg.sender;
            uint amount = contributions[funder];
            require(amount > 0, "Nothing to withdraw");
            contributions[funder] = 0;
            amountRaised -= amount;
            IERC20(crowdToken).transferFrom(
                funder,
                tokenOwner,
                amount * exchangeRate
            );
            // Transfer the funds back to the funder
            payable(funder).transfer(amount);
        }
    }
}
