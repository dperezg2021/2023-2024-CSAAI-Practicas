function dijkstraWithDelays(network, sourceNode, targetNode) {
    const distances = {};
    const previous = {};
    const unvisited = new Set();
    const nodeMap = new Map();

    for (const node of network) {
        distances[node.id] = Infinity;
        previous[node.id] = null;
        unvisited.add(node.id);
        nodeMap.set(node.id, node);
    }

    distances[sourceNode.id] = 0;

    while (unvisited.size > 0) {
        let currentId = null;

        for (const nodeId of unvisited) {
            if (currentId === null || distances[nodeId] < distances[currentId]) {
                currentId = nodeId;
            }
        }

        if (currentId === null || distances[currentId] === Infinity) {
            break;
        }

        if (currentId === targetNode.id) {
            break;
        }

        unvisited.delete(currentId);
        const currentNode = nodeMap.get(currentId);

        for (const { node: neighbor, weight } of currentNode.connections) {
            if (!unvisited.has(neighbor.id)) {
                continue;
            }

            const candidateDistance = distances[currentId] + weight + neighbor.delay;
            if (candidateDistance < distances[neighbor.id]) {
                distances[neighbor.id] = candidateDistance;
                previous[neighbor.id] = currentId;
            }
        }
    }

    const shortestPath = [];
    let traceId = targetNode.id;

    if (distances[targetNode.id] === Infinity) {
        return { shortestPath: [], totalTime: Infinity };
    }

    while (traceId !== null) {
        shortestPath.unshift(nodeMap.get(traceId));
        traceId = previous[traceId];
    }

    return {
        shortestPath,
        totalTime: distances[targetNode.id]
    };
}

function calculatePathTime(path) {
    if (!path || path.length < 2) {
        return 0;
    }

    let totalTime = 0;
    for (let i = 1; i < path.length; i++) {
        const prevNode = path[i - 1];
        const currNode = path[i];
        const edge = prevNode.connections.find(conn => conn.node.id === currNode.id);
        if (!edge) {
            return Infinity;
        }
        totalTime += edge.weight + currNode.delay;
    }

    return totalTime;
}
