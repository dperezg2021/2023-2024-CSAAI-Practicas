const canvas = document.getElementById('networkCanvas');
const ctx = canvas.getContext('2d');

let randomNetwork = null;
let playerPath = [];
let optimalPath = [];
let revealOptimal = false;

const extraConnections = 2;
const nodeRadius = 32;
const maxNodeDelay = 500;

const generateBtn = document.getElementById('generateBtn');
const resetPathBtn = document.getElementById('resetPathBtn');
const calculateBtn = document.getElementById('calculateBtn');
const nodeCountSelect = document.getElementById('nodeCountSelect');
const nodeCountDisplay = document.getElementById('nodeCountDisplay');
const playerTimeDisplay = document.getElementById('playerTimeDisplay');
const optimalTimeDisplay = document.getElementById('optimalTimeDisplay');
const statusMessage = document.getElementById('statusMessage');

class NetworkNode {
    constructor(id, x, y, delay) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.delay = delay;
        this.connections = [];
    }

    connectBidirectional(otherNode, weight) {
        if (!this.isConnected(otherNode.id)) {
            this.connections.push({ node: otherNode, weight });
        }
        if (!otherNode.isConnected(this.id)) {
            otherNode.connections.push({ node: this, weight });
        }
    }

    isConnected(targetId) {
        return this.connections.some(conn => conn.node.id === targetId);
    }

    distanceTo(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        return Math.round(Math.sqrt(dx * dx + dy * dy));
    }
}

function playSound(elementId) {
    const audio = document.getElementById(elementId);
    if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
    }
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createConnectedNetwork(nodeCount, connectionsPerNode) {
    const nodes = [];
    const padding = nodeRadius + 24;
    const minSeparation = nodeRadius * 2.7;

    for (let i = 0; i < nodeCount; i++) {
        const sliceWidth = (canvas.width - padding * 2) / nodeCount;
        const zoneMinX = padding + i * sliceWidth;
        const zoneMaxX = Math.min(canvas.width - padding, zoneMinX + sliceWidth);

        let x = 0;
        let y = 0;
        let attempts = 0;
        let validPosition = false;

        while (!validPosition && attempts < 50) {
            x = randomInt(Math.floor(zoneMinX), Math.floor(zoneMaxX));
            y = randomInt(padding, canvas.height - padding);
            validPosition = nodes.every(existing => existing.distanceTo(x, y) >= minSeparation);
            attempts++;
        }

        const delay = randomInt(20, maxNodeDelay);
        nodes.push(new NetworkNode(i, x, y, delay));
    }

    for (let i = 1; i < nodes.length; i++) {
        let closestPrev = nodes[0];
        let minDist = nodes[i].distanceTo(closestPrev.x, closestPrev.y);

        for (let j = 1; j < i; j++) {
            const dist = nodes[i].distanceTo(nodes[j].x, nodes[j].y);
            if (dist < minDist) {
                minDist = dist;
                closestPrev = nodes[j];
            }
        }

        nodes[i].connectBidirectional(closestPrev, minDist);
    }

    for (const node of nodes) {
        const sortedNeighbors = nodes
            .filter(other => other.id !== node.id && !node.isConnected(other.id))
            .map(other => ({ node: other, dist: node.distanceTo(other.x, other.y) }))
            .sort((a, b) => a.dist - b.dist);

        let added = 0;
        for (const candidate of sortedNeighbors) {
            if (node.connections.length >= connectionsPerNode + 1 || added >= connectionsPerNode) {
                break;
            }
            node.connectBidirectional(candidate.node, candidate.dist);
            added++;
        }
    }

    return nodes;
}

function isEdgeInPath(path, idA, idB) {
    for (let i = 0; i < path.length - 1; i++) {
        const curr = path[i].id;
        const next = path[i + 1].id;
        if ((curr === idA && next === idB) || (curr === idB && next === idA)) {
            return true;
        }
    }
    return false;
}

function drawNetwork(nodes) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!nodes || nodes.length === 0) {
        return;
    }

    const drawnPairs = new Set();

    for (const node of nodes) {
        for (const { node: neighbor, weight } of node.connections) {
            const pairKey = node.id < neighbor.id
                ? `${node.id}-${neighbor.id}`
                : `${neighbor.id}-${node.id}`;

            if (drawnPairs.has(pairKey)) {
                continue;
            }
            drawnPairs.add(pairKey);

            const inPlayer = isEdgeInPath(playerPath, node.id, neighbor.id);
            const inOptimal = revealOptimal && isEdgeInPath(optimalPath, node.id, neighbor.id);

            ctx.save();
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(neighbor.x, neighbor.y);

            if (inOptimal && inPlayer) {
                ctx.strokeStyle = '#10b981';
                ctx.lineWidth = 6;
            } else if (inOptimal) {
                ctx.strokeStyle = '#059669';
                ctx.lineWidth = 5;
                ctx.setLineDash([8, 5]);
            } else if (inPlayer) {
                ctx.strokeStyle = '#f59e0b';
                ctx.lineWidth = 5;
            } else {
                ctx.strokeStyle = '#64748b';
                ctx.lineWidth = 2;
            }
            ctx.stroke();
            ctx.restore();

            const midX = Math.floor((node.x + neighbor.x) / 2);
            const midY = Math.floor((node.y + neighbor.y) / 2);
            const label = `${weight} ms`;

            ctx.font = 'bold 11px system-ui, sans-serif';
            const textWidth = ctx.measureText(label).width;

            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.fillRect(midX - textWidth / 2 - 4, midY - 9, textWidth + 8, 16);

            ctx.fillStyle = '#0f172a';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label, midX, midY - 1);
        }
    }

    const targetId = nodes[nodes.length - 1].id;

    for (const node of nodes) {
        const isSource = node.id === 0;
        const isTarget = node.id === targetId;
        const inPlayer = playerPath.some(n => n.id === node.id);
        const inOptimal = revealOptimal && optimalPath.some(n => n.id === node.id);

        let fillColor = '#2563eb';
        if (isSource) {
            fillColor = '#0284c7';
        } else if (isTarget) {
            fillColor = '#dc2626';
        } else if (inOptimal) {
            fillColor = '#059669';
        } else if (inPlayer) {
            fillColor = '#d97706';
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
        ctx.fillStyle = fillColor;
        ctx.fill();

        ctx.lineWidth = inPlayer || inOptimal ? 4 : 2;
        ctx.strokeStyle = inPlayer ? '#fef08a' : '#0f172a';
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = 'bold 13px system-ui, sans-serif';

        const roleTag = isSource ? ' (INICIO)' : isTarget ? ' (FIN)' : '';
        ctx.fillText(`N${node.id}${roleTag}`, node.x, node.y - 7);

        ctx.font = '11px system-ui, sans-serif';
        const delayLabel = isSource ? '0 ms' : `+${node.delay} ms`;
        ctx.fillText(delayLabel, node.x, node.y + 9);
    }
}

function updateMetricsDisplay() {
    if (!randomNetwork) {
        nodeCountDisplay.textContent = 'Nodos: 0';
        playerTimeDisplay.textContent = 'Tu ruta: -- ms';
        optimalTimeDisplay.textContent = 'Ruta óptima: -- ms';
        return;
    }

    nodeCountDisplay.textContent = `Nodos: ${randomNetwork.length}`;
    const currentPlayerTime = calculatePathTime(playerPath);
    playerTimeDisplay.textContent = playerPath.length > 1
        ? `Tu ruta (${playerPath.map(n => 'N' + n.id).join('→')}): ${currentPlayerTime} ms`
        : 'Tu ruta: N0 (selecciona siguiente nodo)';
}

function showNetworkMissingError() {
    playSound('audioError');
    statusMessage.textContent = '¡Debes generar la red primero!';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillStyle = '#dc2626';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('¡Debes generar la red primero!', canvas.width / 2, canvas.height / 2 + 50);

    const img = new Image();
    img.onload = () => {
        const scaledWidth = img.width * 0.4;
        const scaledHeight = img.height * 0.4;
        ctx.drawImage(
            img,
            (canvas.width - scaledWidth) / 2,
            (canvas.height - scaledHeight) / 2 - 30,
            scaledWidth,
            scaledHeight
        );
    };
    img.src = 'error.png';
}

generateBtn.onclick = () => {
    playSound('audioNetwork');
    const selectedCount = parseInt(nodeCountSelect.value, 10);
    randomNetwork = createConnectedNetwork(selectedCount, extraConnections);
    playerPath = [randomNetwork[0]];
    optimalPath = [];
    revealOptimal = false;

    optimalTimeDisplay.textContent = 'Ruta óptima: -- ms';
    statusMessage.textContent = `Red lista. Haz clic en un nodo conectado a N0 para avanzar hasta N${selectedCount - 1}.`;
    updateMetricsDisplay();
    drawNetwork(randomNetwork);
};

resetPathBtn.onclick = () => {
    if (!randomNetwork) {
        showNetworkMissingError();
        return;
    }
    playSound('audioButton');
    playerPath = [randomNetwork[0]];
    revealOptimal = false;
    optimalTimeDisplay.textContent = 'Ruta óptima: -- ms';
    statusMessage.textContent = 'Ruta reiniciada en N0. Elige tu camino.';
    updateMetricsDisplay();
    drawNetwork(randomNetwork);
};

calculateBtn.onclick = () => {
    if (!randomNetwork) {
        showNetworkMissingError();
        return;
    }

    playSound('audioButton');
    const sourceNode = randomNetwork[0];
    const targetNode = randomNetwork[randomNetwork.length - 1];
    const result = dijkstraWithDelays(randomNetwork, sourceNode, targetNode);

    optimalPath = result.shortestPath;
    revealOptimal = true;

    const optimalNames = optimalPath.map(n => 'N' + n.id).join(' → ');
    optimalTimeDisplay.textContent = `Ruta óptima (${optimalNames}): ${result.totalTime} ms`;

    const lastPlayerNode = playerPath[playerPath.length - 1];
    if (lastPlayerNode.id === targetNode.id) {
        const playerTime = calculatePathTime(playerPath);
        if (playerTime === result.totalTime) {
            statusMessage.textContent = '¡Excelente! Encontraste la ruta más rápida posible.';
        } else {
            const diff = playerTime - result.totalTime;
            statusMessage.textContent = `Llegaste al destino, pero tu ruta tardó ${diff} ms más que la óptima.`;
        }
    } else {
        statusMessage.textContent = `Ruta óptima calculada: ${optimalNames} (${result.totalTime} ms).`;
    }

    drawNetwork(randomNetwork);
};

canvas.addEventListener('click', event => {
    if (!randomNetwork) {
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (event.clientX - rect.left) * scaleX;
    const clickY = (event.clientY - rect.top) * scaleY;

    const clickedNode = randomNetwork.find(node => node.distanceTo(clickX, clickY) <= nodeRadius);
    if (!clickedNode) {
        return;
    }

    const lastSelected = playerPath[playerPath.length - 1];
    const targetNode = randomNetwork[randomNetwork.length - 1];

    if (playerPath.length > 1 && clickedNode.id === playerPath[playerPath.length - 2].id) {
        playerPath.pop();
        playSound('audioButton');
        statusMessage.textContent = `Retrocediste a N${clickedNode.id}.`;
        updateMetricsDisplay();
        drawNetwork(randomNetwork);
        return;
    }

    if (lastSelected.id === targetNode.id) {
        statusMessage.textContent = 'Ya llegaste al destino. Pulsa "Comparar con Dijkstra" o "Reiniciar Ruta".';
        return;
    }

    if (!lastSelected.isConnected(clickedNode.id)) {
        playSound('audioError');
        statusMessage.textContent = `N${clickedNode.id} no está conectado directamente con N${lastSelected.id}.`;
        return;
    }

    if (playerPath.some(n => n.id === clickedNode.id)) {
        playSound('audioError');
        statusMessage.textContent = `Ya pasaste por N${clickedNode.id}. Evita ciclos en la ruta.`;
        return;
    }

    playerPath.push(clickedNode);
    playSound('audioButton');
    updateMetricsDisplay();
    drawNetwork(randomNetwork);

    if (clickedNode.id === targetNode.id) {
        statusMessage.textContent = '¡Destino alcanzado! Pulsa "Comparar con Dijkstra" para ver tu puntuación.';
    } else {
        statusMessage.textContent = `Avanzaste a N${clickedNode.id}. Selecciona el siguiente nodo conectado.`;
    }
});
