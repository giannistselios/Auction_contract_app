import React, { Component, useEffect } from "react";
import AuctionContract from "./contracts/Auction.json";
import getWeb3 from "./getWeb3";

import "./App.css";


class App extends Component {
    state = { highestBid: 0, web3: null, accounts: null, contract: null, owner: null, highestBidder: null, tempValue: 0, contract_value: 0};

    componentDidMount = async () => {
        try {
        // Get network provider and web3 instance.
        const web3 = await getWeb3();

        // Use web3 to get the user's accounts.
        const accounts = await web3.eth.getAccounts();

        // Get the contract instance.
        const networkId = await web3.eth.net.getId();
        const deployedNetwork = AuctionContract.networks[networkId];
        const instance = new web3.eth.Contract(
            AuctionContract.abi,
            deployedNetwork && deployedNetwork.address,
        );
        // Set web3, accounts, and contract to the state, and then proceed with an
        // example of interacting with the contract's methods.
        this.setState({ web3, accounts, contract: instance });
        } catch (error) {
        // Catch any errors for any of the above operations.
        alert(
            `Failed to load web3, accounts, or contract. Check console for details.`,
        );
        console.error(error);
        }
    };
    
    submitBid = async (event) => {
        const {highestBid, tempValue, contract, accounts, contract_value} = this.state;
        
        await contract.methods.bid().send({from: accounts[0], value: tempValue});
        const temp = await contract.methods.highestBid.call();
        this.setState({highestBid: temp});
        event.preventDefault();
    }
    
    HighestBidInit = async () => {
        const contract = this.state.contract;
        const result = await contract.methods.highestBid().call();
        this.setState({ highestBid: result });
    };
    
    HighestBidderInit = async () => {
        const contract = this.state.contract;
        const result = await contract.methods.highestBidder().call();
        this.setState({ highestBidder: result });
    };
    
    ownerInit = async () => {
        const contract = this.state.contract;
        const result = await contract.methods.owner().call();
        this.setState({ owner: result });
    };
    
    contractValueInit = async () => {
        const {owner, web3, contract } = this.state;
        const value = await web3.eth.getBalance(contract.options.address);
        this.setState({contract_value: value});
    }
    
    BidHandler = (event) => {
        this.setState({tempValue: event.target.value});
    }
    
    submitWithdraw = async (event) => {
        const { accounts, contract } = this.state;
        await contract.methods.withdraw().send({ from: accounts[0] });
    }

    render() {
        if (!this.state.web3) {
        return <div>Loading Web3, accounts, and contract...</div>;
        }
        
        return (
            <div className="App">
                <div className = "Header">
                    <h9>Smart Contract</h9>
                </div>
                <ul className = "listOfButtons">
                    <li>
                        <button className = "btn" onClick = {this.ownerInit}>Owner</button>
                        <h1>{this.state.owner}</h1>
                    </li>
                    <li>
                        <button className = "btn" onClick = {this.HighestBidInit}>Highest Bid</button>
                        <h1>{this.state.highestBid}</h1>
                    </li>
                    <li>
                        <button className = "btn" onClick = {this.HighestBidderInit}>Highest bidder address</button>
                        <h1>{this.state.highestBidder}</h1>
                    </li>
                    <li>
                        <button className = "btn" onClick = {this.contractValueInit}>Contract value</button>
                        <h1>{this.state.contract_value}</h1>
                    </li>
                </ul>
                
                <div className="Bid">
                    <form onSubmit={this.submitBid}>
                        <input
                            type='text'
                            onChange={this.BidHandler}
                        />
                        <input className = "btn" type='submit' value='BID'/>
                    </form>
                </div>
                
                <div className="withdraw">
                    <form onSubmit={this.submitWithdraw}>
                        <input className = "btn"type='submit' value='WITHDRAW'/>
                    </form>
                </div>
            </div>
        );
    }
}

export default App;
