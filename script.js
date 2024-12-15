const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
let contract;

const contractAddress = "0xCAA63a4128243F7deAF858d4C74Aa38b3a5A3E80";
const contractABI = [
    {"inputs":[{"internalType":"address","name":"_tokenA","type":"address"},{"internalType":"address","name":"_tokenB","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"provider","type":"address"},{"indexed":false,"internalType":"uint256","name":"amountA","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountB","type":"uint256"}],"name":"LiquidityAdded","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"provider","type":"address"},{"indexed":false,"internalType":"uint256","name":"amountA","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountB","type":"uint256"}],"name":"LiquidityRemoved","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amountIn","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountOut","type":"uint256"},{"indexed":false,"internalType":"bool","name":"swappedAforB","type":"bool"}],"name":"TokensSwapped","type":"event"},
    {"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"name":"addLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"_token","type":"address"}],"name":"getPrice","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"amountA","type":"uint256"},{"internalType":"uint256","name":"amountB","type":"uint256"}],"name":"removeLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"reserveA","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"reserveB","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"amountAIn","type":"uint256"}],"name":"swapAforB","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"amountBIn","type":"uint256"}],"name":"swapBforA","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"tokenA","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"tokenB","outputs":[{"internalType":"contract IERC20","name":"","type":"address"}],"stateMutability":"view","type":"function"}
];

async function init() {
    document.getElementById("connectButton").addEventListener("click", connectWallet);
    document.getElementById("disconnectButton").addEventListener("click", disconnectWallet);
}

async function connectWallet() {
    try {
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        const walletAddress = await signer.getAddress();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        
        const walletAddressElement = document.getElementById("walletAddress");
        if (walletAddressElement) {
            walletAddressElement.innerText = `Wallet conectada: ${walletAddress}`;
            walletAddressElement.style.display = "block";
        } else {
            console.error("Elemento 'walletAddress' no encontrado.");
        }

        const connectButton = document.getElementById("connectButton");
        const disconnectButton = document.getElementById("disconnectButton");
        if (connectButton) {
            connectButton.style.display = "none";
        } else {
            console.error("Elemento 'connectButton' no encontrado.");
        }

        if (disconnectButton) {
            disconnectButton.style.display = "inline";
        } else {
            console.error("Elemento 'disconnectButton' no encontrado.");
        }

        const sections = [
            "liquiditySection",
            "removeLiquiditySection",
            "swapSection",
            "priceSection"
        ];

        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.style.display = "block";
            } else {
                console.error(`Elemento '${sectionId}' no encontrado.`);
            }
        });
    } catch (error) {
        console.error("Error conectando la wallet:", error);
        alert("No se pudo conectar la wallet. Revisa la consola para más detalles.");
    }
}

async function disconnectWallet() {
    signer = null;
    contract = null;

    const walletAddressElement = document.getElementById("walletAddress");
    if (walletAddressElement) {
        walletAddressElement.innerText = "";
        walletAddressElement.style.display = "none";
    }

    const connectButton = document.getElementById("connectButton");
    const disconnectButton = document.getElementById("disconnectButton");
    if (connectButton) {
        connectButton.style.display = "inline";
    }
    if (disconnectButton) {
        disconnectButton.style.display = "none";
    }

    alert("Wallet desconectada.");
}




async function approveTokens(amountA, amountB) {
    const tokenAAddress = await contract.tokenA();
    const tokenBAddress = await contract.tokenB();
    
    const tokenA = new ethers.Contract(tokenAAddress, [
        "function approve(address spender, uint256 amount) public returns (bool)"
    ], signer);
    
    const tokenB = new ethers.Contract(tokenBAddress, [
        "function approve(address spender, uint256 amount) public returns (bool)"
    ], signer);
    
    await tokenA.approve(contractAddress, amountA);
    await tokenB.approve(contractAddress, amountB);
}

async function approveLiquidity() {
    const amountA = ethers.utils.parseUnits(document.getElementById("amountA").value, 18);
    const amountB = ethers.utils.parseUnits(document.getElementById("amountB").value, 18);
    
    try {
        await approveTokens(amountA, amountB);
        alert("Tokens aprobados!");
    } catch (error) {
        console.error("Error al aprobar los tokens:", error);
        alert("Error al aprobar los tokens. Revisa la consola.");
    }
}

async function addLiquidity() {
    const amountA = ethers.utils.parseUnits(document.getElementById("amountA").value, 18); 
    const amountB = ethers.utils.parseUnits(document.getElementById("amountB").value, 18);
    
    const tokenAAddress = await contract.tokenA();
    const tokenBAddress = await contract.tokenB();

    const tokenA = new ethers.Contract(tokenAAddress, [
        "function balanceOf(address owner) view returns (uint256)"
    ], signer);
    
    const tokenB = new ethers.Contract(tokenBAddress, [
        "function balanceOf(address owner) view returns (uint256)"
    ], signer);

    const balanceA = await tokenA.balanceOf(await signer.getAddress());
    const balanceB = await tokenB.balanceOf(await signer.getAddress());

    if (balanceA.lt(amountA)) {
        alert("No tienes suficiente Token A.");
        return;
    }
    
    if (balanceB.lt(amountB)) {
        alert("No tienes suficiente Token B.");
        return;
    }

    try {
        const tx = await contract.addLiquidity(amountA, amountB);
        await tx.wait();
        alert("Liquidez agregada!");
    } catch (error) {
        console.error("Error al agregar liquidez:", error);
        alert("Error al agregar liquidez. Revisa la consola.");
    }
}

async function removeLiquidity() {
    const liquidityAmount = ethers.utils.parseUnits(document.getElementById("liquidityAmount").value, 18);
    
    try {
        const tx = await contract.removeLiquidity(liquidityAmount);
        await tx.wait();
        alert("Liquidez retirada!");
    } catch (error) {
        console.error("Error al retirar liquidez:", error);
        alert("Error al retirar liquidez. Revisa la consola.");
    }
}

async function swapAToB() {
    const swapAmountA = ethers.utils.parseUnits(document.getElementById("swapAmountA").value, 18);
    
    try {
        const tx = await contract.swapAforB(swapAmountA);
        await tx.wait();
        alert("Intercambio completo!");
    } catch (error) {
        console.error("Error al intercambiar A por B:", error);
        alert("Error al intercambiar. Revisa la consola.");
    }
}

async function swapBToA() {
    const swapAmountB = ethers.utils.parseUnits(document.getElementById("swapAmountB").value, 18);
    
    try {
        const tx = await contract.swapBforA(swapAmountB);
        await tx.wait();
        alert("Intercambio completo!");
    } catch (error) {
        console.error("Error al intercambiar B por A:", error);
        alert("Error al intercambiar. Revisa la consola.");
    }
}

async function getPrice() {
    const tokenAddress = document.getElementById("tokenAddress").value;
    if (!ethers.utils.isAddress(tokenAddress)) {
        alert("Por favor, ingresa una dirección de token válida.");
        return;
    }
    
    try {
        const price = await contract.getPrice(tokenAddress);
        document.getElementById("priceDisplay").innerText = `Precio: ${ethers.utils.formatUnits(price, 18)}`; 
    } catch (error) {
        console.error("Error al obtener el precio:", error);
        alert("Error al obtener el precio. Revisa la consola.");
    }
}

window.onload = init;