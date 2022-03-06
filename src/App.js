import { ethers, Signer } from "ethers";
import { useEffect, useState } from "react";
import "./App.css";
import Greeter from "./artifacts/contracts/Greeter.sol/Greeter.json";
import Token from "./artifacts/contracts/Token.sol/Token.json";
import Lottery from "./artifacts/contracts/Lottery.sol/Lottery.json";
// import { lottery_abi } from "./config";

const greeterAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";
const tokenAddress = "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707";
const lotteryAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [greeting, setGreetingValue] = useState("");
  const [updatedGreeting, setUpdatedGreeting] = useState("");
  const [userAccount, setUserAccount] = useState("");
  const [amount, setAmount] = useState(0);
  const [manager, setManager] = useState("");
  const [players, setPlayers] = useState([]);
  const [balence, setBalence] = useState(null);
  const [myAccount, setmyAccount] = useState(null);
  const [lotteryCont, setlotteryCont] = useState(null);
  const [value, setValue] = useState("");
  const [message, setmessage] = useState("");

  useEffect(() => {
    (async () => {
      if (typeof window.ethereum !== "undefined") {
        await requestAccount();
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.listAccounts();
        console.log(accounts);
        setmyAccount(accounts[0]);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (typeof window.ethereum !== "undefined") {
        await requestAccount();
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const contract = new ethers.Contract(lotteryAddress, Lottery.abi, provider);
          setlotteryCont(contract);
          const contractManager = await contract.manager();
          const players = await contract.getPlayers();
          const balence = await provider.getBalance(contract.address);
          console.log(contract, contractManager, players, balence);
          // console.log(contract.enter());
          setPlayers(players);
          setBalence(balence);
          setManager(contractManager);
        } catch (error) {
          console.error(error);
        }
      }
    })();
  }, []);

  const onSubmit = async e => {
    e.preventDefault();
    if (value < 0) {
      return;
    }
    if (lotteryCont) {
      try {
        console.log(lotteryCont);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // const signer = new ethers.VoidSigner(lotteryAddress, provider);
        const signer = provider.getSigner();
        // const signer = new ethers.Signer();
        // const signer = provider.getSigner(lotteryAddress);
        setmessage("Waiting on tansaction success....");
        await signer.sendTransaction({
          to: myAccount,
          // from: myAccount,
          value: ethers.utils.parseUnits(value.toString(), "ether"),
          nonce: provider.getTransactionCount(myAccount, "latest"),
        });
        // const contract = new ethers.Contract(lotteryAddress, Lottery.abi, signer);
        // const txtRes = await contract.enter();
        // const txtRecipt = await txtRes.wait();
        // console.log(txtRecipt);
        setmessage("You are entered");
      } catch (error) {
        console.error(error);
      }
    }
  };

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

        <div>
          <h2>Lottery Contract</h2>
          <p>This contract is managed by {manager}</p>
          <p>There are currently {players.length} people entered</p>
          <p>competing to win {balence && ethers.utils.formatEther(balence)} ether!</p>
        </div>
        <form onSubmit={onSubmit}>
          <h5>Input the number of ether to enter the contrat</h5>
          <input
            type='number'
            value={value}
            onChange={e => {
              setValue(e.target.value);
            }}
          />
          <button type='submit'>submit</button>
        </form>
        <h3>{message}</h3>
        {/* <div>
          {!account && <button onClick={activateBrowserWallet}> Connect </button>}
          {account && <p>Account: {account}</p>}
        </div> */}
      </header>
    </div>
  );
}

export default App;
