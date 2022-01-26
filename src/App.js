import { ethers } from "ethers";
import { useState } from "react";
import "./App.css";
import Greeter from "./artifacts/contracts/Greeter.sol/Greeter.json";
import Token from "./artifacts/contracts/Token.sol/Token.json";

const greeterAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const tokenAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";

function App() {
  const [greeting, setGreetingValue] = useState("");
  const [updatedGreeting, setUpdatedGreeting] = useState("");
  const [userAccount, setUserAccount] = useState("");
  const [amount, setAmount] = useState(0);

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  const fetchGreeting = async () => {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log({ provider });

      const contract = new ethers.Contract(greeterAddress, Greeter.abi, provider);

      try {
        const data = await contract.greet();
        console.log("data:", data);
        setUpdatedGreeting(data);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const getBalances = async () => {
    if (typeof window.ethereum !== "undefined") {
      const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log({ provider });

      const contract = new ethers.Contract(tokenAddress, Token.abi, provider);

      try {
        const data = await contract.balanceOf(account);
        console.log("Balance:", data.toString());
      } catch (error) {
        console.error(error);
      }
    }
  };

  const sendToken = async () => {
    if (!userAccount) return;
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log({ provider });

      const signer = provider.getSigner();

      const contract = new ethers.Contract(tokenAddress, Token.abi, signer);
      try {
        const transaction = await contract.transfer(userAccount, amount);
        await transaction.wait();
        console.log(`${amount} token send to ${userAccount}`);
        getBalances();
      } catch (error) {
        console.error(error);
      }
    }
  };
  const setGreeting = async () => {
    if (!greeting) return;
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log({ provider });

      const signer = provider.getSigner();

      const contract = new ethers.Contract(greeterAddress, Greeter.abi, signer);

      const transaction = await contract.setGreeting(greeting);
      await transaction.wait();
      setGreetingValue("");
      fetchGreeting();
    }
  };

  return (
    <div className='App'>
      <header className='App-header'>
        <div>
          <span>{updatedGreeting}</span>
        </div>

        <button onClick={fetchGreeting}>Fetch Greeting</button>
        <button onClick={setGreeting}>Set Greeting</button>
        <input value={greeting} onChange={e => setGreetingValue(e.target.value)} placeholder='set greeting' />

        <br />

        <button onClick={getBalances}>Get Balance</button>
        <button onClick={sendToken}>Send Token</button>
        <input value={userAccount} onChange={e => setUserAccount(e.target.value)} placeholder='Account ID' />
        <input
          value={amount}
          type={"number"}
          onChange={e => setAmount(e.target.value)}
          placeholder='Amount of token to send'
        />
      </header>
    </div>
  );
}

export default App;
