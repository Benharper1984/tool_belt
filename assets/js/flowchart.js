/**
 * Flowchart Collaborator - Core JavaScript Classes
 * Visual flowchart editor for AI collaboration
 */

class FlowchartEditor {
    constructor(canvasId) {
        this.canvas = new FlowchartCanvas(canvasId);
        this.data = {
            version: 1,
            timestamp: new Date().toISOString(),
            title: 'New Flowchart',
            description: '',
            generalNotes: '',
            flowcharts: [{
                id: 'flowchart-1',
                title: 'Main Process',
                description: '',
                nodes: [],
                connections: [],
                questions: []
            }]
        };
        
        this.selectedElement = null;
        this.nextNodeId = 1;
        this.nextConnectionId = 1;
        this.nextQuestionId = 1;
        
        // Set up canvas event handlers
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        const self = this;
        
        // Canvas click handler
        this.canvas.on('canvasClick', (event, coordinates) => {
            if (window.currentMode === 'add' && window.selectedNodeType) {
                this.addNode(window.selectedNodeType, coordinates.x, coordinates.y);
                window.setMode('select');
            } else {
                this.clearSelection();
            }
        });
        
        // Node event handlers
        this.canvas.on('nodeClick', (event, node) => {
            event.stopPropagation();
            this.selectElement(node, 'node');
        });
        
        this.canvas.on('nodeDrag', (event, node, newPosition) => {
            this.updateNodePosition(node.id, newPosition.x, newPosition.y);
        });
        
        this.canvas.on('nodeDoubleClick', (event, node) => {
            this.editNodeText(node);
        });
        
        // Connection event handlers
        this.canvas.on('connectionClick', (event, connection) => {
            event.stopPropagation();
            this.selectElement(connection, 'connection');
        });
        
        // Connection creation handler
        this.canvas.on('nodeConnectionStart', (event, fromNode) => {
            if (window.currentMode === 'connect') {
                this.startConnection(fromNode);
            }
        });
        
        this.canvas.on('nodeConnectionEnd', (event, toNode) => {
            if (window.currentMode === 'connect' && this.connectionInProgress) {
                this.completeConnection(toNode);
            }
        });
    }
    
    // Node management
    addNode(type, x, y) {
        const nodeId = `node-${this.nextNodeId++}`;
        const nodeData = {
            id: nodeId,
            type: type,
            text: this.getDefaultNodeText(type),
            x: x,
            y: y,
            width: this.getDefaultNodeSize(type).width,
            height: this.getDefaultNodeSize(type).height,
            style: {
                backgroundColor: this.getDefaultNodeColor(type),
                borderColor: '#1976d2',
                textColor: '#000'
            },
            metadata: {
                category: 'core',
                priority: 'medium',
                status: 'pending',
                note: ''
            }
        };
        
        this.getCurrentFlowchart().nodes.push(nodeData);
        this.canvas.renderNode(nodeData);
        this.updateStats();
        
        // Track analytics
        if (typeof window.trackEvent !== 'undefined') {
            window.trackEvent('node_added', { type: type });
        }
        
        return nodeData;
    }
    
    updateNodePosition(nodeId, x, y) {
        const node = this.findNodeById(nodeId);
        if (node) {
            node.x = x;
            node.y = y;
            this.canvas.updateNodePosition(node);
        }
    }
    
    updateNodeText(nodeId, text) {
        const node = this.findNodeById(nodeId);
        if (node) {
            node.text = text;
            this.canvas.updateNodeText(node);
        }
    }
    
    updateNodeType(nodeId, type) {
        const node = this.findNodeById(nodeId);
        if (node) {
            node.type = type;
            node.style.backgroundColor = this.getDefaultNodeColor(type);
            const size = this.getDefaultNodeSize(type);
            node.width = size.width;
            node.height = size.height;
            this.canvas.updateNode(node);
        }
    }
    
    updateNodeStatus(nodeId, status) {
        const node = this.findNodeById(nodeId);
        if (node) {
            node.metadata.status = status;
            this.canvas.updateNodeStatus(node);
        }
    }
    
    updateNodeNotes(nodeId, notes) {
        const node = this.findNodeById(nodeId);
        if (node) {
            node.metadata.note = notes;
        }
    }
    
    deleteNode(nodeId) {
        const flowchart = this.getCurrentFlowchart();
        
        // Remove the node
        flowchart.nodes = flowchart.nodes.filter(n => n.id !== nodeId);
        
        // Remove all connections to/from this node
        flowchart.connections = flowchart.connections.filter(c => 
            c.from !== nodeId && c.to !== nodeId
        );
        
        this.canvas.removeNode(nodeId);
        this.updateStats();
    }
    
    // Connection management
    startConnection(fromNode) {
        this.connectionInProgress = {
            from: fromNode.id,
            fromNode: fromNode
        };
        this.canvas.startConnectionDraw(fromNode);
    }
    
    completeConnection(toNode) {
        if (this.connectionInProgress && this.connectionInProgress.from !== toNode.id) {
            this.addConnection(this.connectionInProgress.from, toNode.id);
        }
        this.connectionInProgress = null;
        this.canvas.endConnectionDraw();
    }
    
    addConnection(fromNodeId, toNodeId, label = '') {
        const connectionId = `conn-${this.nextConnectionId++}`;
        const connectionData = {
            id: connectionId,
            from: fromNodeId,
            to: toNodeId,
            label: label,
            style: 'solid',
            metadata: {
                status: 'pending',
                note: ''
            }
        };
        
        this.getCurrentFlowchart().connections.push(connectionData);
        this.canvas.renderConnection(connectionData);
        this.updateStats();
        
        // Track analytics
        if (typeof window.trackEvent !== 'undefined') {
            window.trackEvent('connection_added');
        }
        
        return connectionData;
    }
    
    updateConnectionLabel(connectionId, label) {
        const connection = this.findConnectionById(connectionId);
        if (connection) {
            connection.label = label;
            this.canvas.updateConnectionLabel(connection);
        }
    }
    
    updateConnectionStyle(connectionId, style) {
        const connection = this.findConnectionById(connectionId);
        if (connection) {
            connection.style = style;
            this.canvas.updateConnectionStyle(connection);
        }
    }
    
    updateConnectionStatus(connectionId, status) {
        const connection = this.findConnectionById(connectionId);
        if (connection) {
            connection.metadata.status = status;
            this.canvas.updateConnectionStatus(connection);
        }
    }
    
    deleteConnection(connectionId) {
        const flowchart = this.getCurrentFlowchart();
        flowchart.connections = flowchart.connections.filter(c => c.id !== connectionId);
        this.canvas.removeConnection(connectionId);
        this.updateStats();
    }
    
    // Selection management
    selectElement(element, type) {
        this.selectedElement = { ...element, type: type };
        this.canvas.selectElement(element, type);
        window.selectedElement = this.selectedElement;
        window.updatePropertiesPanel();
    }
    
    clearSelection() {
        this.selectedElement = null;
        this.canvas.clearSelection();
        window.selectedElement = null;
        window.updatePropertiesPanel();
    }
    
    // Data management
    loadFromJSON(jsonData) {
        try {
            if (jsonData.version && jsonData.flowcharts) {
                this.data = jsonData;
            } else {
                // Legacy format or simple node array
                this.data.flowcharts[0].nodes = jsonData.nodes || [];
                this.data.flowcharts[0].connections = jsonData.connections || [];
                this.data.flowcharts[0].questions = jsonData.questions || [];
            }
            
            // Update ID counters
            this.updateIdCounters();
            
            // Render everything
            this.canvas.clear();
            this.renderAll();
            this.updateStats();
            
            // Update UI
            if (this.data.description) {
                document.getElementById('flowchart-description').value = this.data.description;
            }
            if (this.data.generalNotes) {
                document.getElementById('general-notes').value = this.data.generalNotes;
            }
            
        } catch (error) {
            console.error('Error loading JSON data:', error);
            if (typeof showNotification !== 'undefined') {
                showNotification('Error loading flowchart data', 'error');
            }
        }
    }
    
    exportToJSON() {
        this.data.timestamp = new Date().toISOString();
        return JSON.parse(JSON.stringify(this.data)); // Deep clone
    }
    
    updateDescription(description) {
        this.data.description = description;
    }
    
    updateGeneralNotes(notes) {
        this.data.generalNotes = notes;
    }
    
    // Utility methods
    getCurrentFlowchart() {
        return this.data.flowcharts[0]; // For now, always use the first flowchart
    }
    
    findNodeById(nodeId) {
        return this.getCurrentFlowchart().nodes.find(n => n.id === nodeId);
    }
    
    findConnectionById(connectionId) {
        return this.getCurrentFlowchart().connections.find(c => c.id === connectionId);
    }
    
    updateIdCounters() {
        const flowchart = this.getCurrentFlowchart();
        
        // Update node ID counter
        const nodeIds = flowchart.nodes.map(n => {
            const match = n.id.match(/node-(\d+)/);
            return match ? parseInt(match[1]) : 0;
        });
        this.nextNodeId = Math.max(0, ...nodeIds) + 1;
        
        // Update connection ID counter
        const connectionIds = flowchart.connections.map(c => {
            const match = c.id.match(/conn-(\d+)/);
            return match ? parseInt(match[1]) : 0;
        });
        this.nextConnectionId = Math.max(0, ...connectionIds) + 1;
        
        // Update question ID counter
        const questionIds = flowchart.questions.map(q => {
            const match = q.id.match(/q-(\d+)/);
            return match ? parseInt(match[1]) : 0;
        });
        this.nextQuestionId = Math.max(0, ...questionIds) + 1;
    }
    
    renderAll() {
        const flowchart = this.getCurrentFlowchart();
        
        // Render all nodes
        flowchart.nodes.forEach(node => {
            this.canvas.renderNode(node);
        });
        
        // Render all connections
        flowchart.connections.forEach(connection => {
            this.canvas.renderConnection(connection);
        });
        
        // Render questions
        this.updateQuestionsPanel();
    }
    
    updateStats() {
        const flowchart = this.getCurrentFlowchart();
        document.getElementById('node-count').textContent = `Nodes: ${flowchart.nodes.length}`;
        document.getElementById('connection-count').textContent = `Connections: ${flowchart.connections.length}`;
    }
    
    updateQuestionsPanel() {
        const questionsContainer = document.getElementById('questions-list');
        const flowchart = this.getCurrentFlowchart();
        
        if (flowchart.questions.length === 0) {
            questionsContainer.innerHTML = '<p class="text-muted">No questions yet. Questions will appear here when imported from AI.</p>';
            return;
        }
        
        questionsContainer.innerHTML = '';
        flowchart.questions.forEach(question => {
            const questionElement = this.createQuestionElement(question);
            questionsContainer.appendChild(questionElement);
        });
    }
    
    createQuestionElement(question) {
        const div = document.createElement('div');
        div.className = 'question-item';
        div.innerHTML = `
            <span class="question-category">${question.category}</span>
            <div class="question-text">${question.text}</div>
            <textarea class="question-answer" placeholder="Type your answer here..." data-question-id="${question.id}">${question.answer || ''}</textarea>
        `;
        
        // Add event listener for answer updates
        const textarea = div.querySelector('.question-answer');
        textarea.addEventListener('input', (e) => {
            question.answer = e.target.value;
        });
        
        return div;
    }
    
    getDefaultNodeText(type) {
        const defaults = {
            start: 'Start',
            process: 'Process',
            decision: 'Decision?',
            end: 'End',
            connector: ''
        };
        return defaults[type] || 'Node';
    }
    
    getDefaultNodeSize(type) {
        const sizes = {
            start: { width: 100, height: 60 },
            process: { width: 120, height: 60 },
            decision: { width: 100, height: 80 },
            end: { width: 100, height: 60 },
            connector: { width: 30, height: 30 }
        };
        return sizes[type] || { width: 120, height: 60 };
    }
    
    getDefaultNodeColor(type) {
        const colors = {
            start: '#e8f5e8',
            process: '#e3f2fd',
            decision: '#fff3e0',
            end: '#fce4ec',
            connector: '#f5f5f5'
        };
        return colors[type] || '#e3f2fd';
    }
    
    clearAll() {
        this.getCurrentFlowchart().nodes = [];
        this.getCurrentFlowchart().connections = [];
        this.getCurrentFlowchart().questions = [];
        this.canvas.clear();
        this.clearSelection();
        this.updateStats();
        this.updateQuestionsPanel();
    }
    
    fitToScreen() {
        this.canvas.fitToScreen();
    }
    
    resetZoom() {
        this.canvas.resetZoom();
    }
    
    editNodeText(node) {
        const text = prompt('Enter node text:', node.text);
        if (text !== null) {
            this.updateNodeText(node.id, text);
        }
    }
}

class FlowchartCanvas {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.svg = d3.select(`#${canvasId}`);
        this.mainGroup = this.svg.select('#main-group');
        this.nodesGroup = this.svg.select('#nodes-group');
        this.connectionsGroup = this.svg.select('#connections-group');
        
        this.zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.mainGroup.attr('transform', event.transform);
                this.updateZoomLevel(event.transform.k);
            });
        
        this.svg.call(this.zoom);
        
        this.currentTransform = d3.zoomIdentity;
        this.eventHandlers = {};
        this.selectedElement = null;
        this.connectionInProgress = null;
        
        this.setupCanvasEvents();
    }
    
    setupCanvasEvents() {
        // Canvas click handler
        this.svg.on('click', (event) => {
            if (event.target === this.svg.node() || event.target.tagName === 'rect') {
                const [x, y] = d3.pointer(event, this.mainGroup.node());
                this.emit('canvasClick', event, { x, y });
            }
        });
    }
    
    // Event system
    on(eventName, handler) {
        if (!this.eventHandlers[eventName]) {
            this.eventHandlers[eventName] = [];
        }
        this.eventHandlers[eventName].push(handler);
    }
    
    emit(eventName, ...args) {
        if (this.eventHandlers[eventName]) {
            this.eventHandlers[eventName].forEach(handler => {
                handler.apply(this, args);
            });
        }
    }
    
    // Node rendering
    renderNode(nodeData) {
        const nodeGroup = this.nodesGroup.append('g')
            .attr('class', 'flowchart-node')
            .attr('data-node-id', nodeData.id)
            .attr('transform', `translate(${nodeData.x}, ${nodeData.y})`);
        
        // Create node shape based on type
        this.createNodeShape(nodeGroup, nodeData);
        
        // Add text
        nodeGroup.append('text')
            .attr('class', 'node-text')
            .attr('x', nodeData.width / 2)
            .attr('y', nodeData.height / 2)
            .text(nodeData.text);
        
        // Add event handlers
        this.setupNodeEvents(nodeGroup, nodeData);
        
        // Apply status styling
        this.updateNodeStatus(nodeData);
        
        return nodeGroup;
    }
    
    createNodeShape(nodeGroup, nodeData) {
        const { width, height, style } = nodeData;
        
        switch (nodeData.type) {
            case 'start':
            case 'end':
                // Oval shape
                nodeGroup.append('ellipse')
                    .attr('cx', width / 2)
                    .attr('cy', height / 2)
                    .attr('rx', width / 2)
                    .attr('ry', height / 2)
                    .attr('fill', style.backgroundColor)
                    .attr('stroke', style.borderColor)
                    .attr('stroke-width', 2);
                break;
                
            case 'decision':
                // Diamond shape
                const points = [
                    [width / 2, 0],
                    [width, height / 2],
                    [width / 2, height],
                    [0, height / 2]
                ];
                nodeGroup.append('polygon')
                    .attr('points', points.map(p => p.join(',')).join(' '))
                    .attr('fill', style.backgroundColor)
                    .attr('stroke', style.borderColor)
                    .attr('stroke-width', 2);
                break;
                
            case 'connector':
                // Small circle
                nodeGroup.append('circle')
                    .attr('cx', width / 2)
                    .attr('cy', height / 2)
                    .attr('r', Math.min(width, height) / 2)
                    .attr('fill', style.backgroundColor)
                    .attr('stroke', style.borderColor)
                    .attr('stroke-width', 2);
                break;
                
            default: // process
                // Rectangle
                nodeGroup.append('rect')
                    .attr('width', width)
                    .attr('height', height)
                    .attr('rx', 4)
                    .attr('ry', 4)
                    .attr('fill', style.backgroundColor)
                    .attr('stroke', style.borderColor)
                    .attr('stroke-width', 2);
                break;
        }
    }
    
    setupNodeEvents(nodeGroup, nodeData) {
        const self = this;
        
        // Drag behavior
        const drag = d3.drag()
            .on('start', function(event) {
                d3.select(this).raise().classed('dragging', true);
            })
            .on('drag', function(event) {
                const newX = nodeData.x + event.dx;
                const newY = nodeData.y + event.dy;
                nodeData.x = newX;
                nodeData.y = newY;
                d3.select(this).attr('transform', `translate(${newX}, ${newY})`);
                
                // Update connections
                self.updateNodeConnections(nodeData.id);
                
                self.emit('nodeDrag', event, nodeData, { x: newX, y: newY });
            })
            .on('end', function(event) {
                d3.select(this).classed('dragging', false);
            });
        
        nodeGroup.call(drag);
        
        // Click events
        nodeGroup.on('click', (event) => {
            this.emit('nodeClick', event, nodeData);
        });
        
        nodeGroup.on('dblclick', (event) => {
            this.emit('nodeDoubleClick', event, nodeData);
        });
        
        // Connection events
        nodeGroup.on('mousedown', (event) => {
            if (window.currentMode === 'connect') {
                this.emit('nodeConnectionStart', event, nodeData);
            }
        });
        
        nodeGroup.on('mouseup', (event) => {
            if (window.currentMode === 'connect') {
                this.emit('nodeConnectionEnd', event, nodeData);
            }
        });
    }
    
    updateNodePosition(nodeData) {
        const nodeGroup = this.nodesGroup.select(`[data-node-id="${nodeData.id}"]`);
        nodeGroup.attr('transform', `translate(${nodeData.x}, ${nodeData.y})`);
        this.updateNodeConnections(nodeData.id);
    }
    
    updateNodeText(nodeData) {
        const nodeGroup = this.nodesGroup.select(`[data-node-id="${nodeData.id}"]`);
        nodeGroup.select('.node-text').text(nodeData.text);
    }
    
    updateNode(nodeData) {
        // Remove old node and create new one
        this.removeNode(nodeData.id);
        this.renderNode(nodeData);
    }
    
    updateNodeStatus(nodeData) {
        const nodeGroup = this.nodesGroup.select(`[data-node-id="${nodeData.id}"]`);
        const status = nodeData.metadata?.status || 'pending';
        
        nodeGroup.classed('approved', status === 'approved')
                 .classed('rejected', status === 'rejected')
                 .classed('pending', status === 'pending');
    }
    
    removeNode(nodeId) {
        this.nodesGroup.select(`[data-node-id="${nodeId}"]`).remove();
    }
    
    // Connection rendering
    renderConnection(connectionData) {
        // Find source and target nodes
        const sourceNode = window.flowchartEditor.findNodeById(connectionData.from);
        const targetNode = window.flowchartEditor.findNodeById(connectionData.to);
        
        if (!sourceNode || !targetNode) return;
        
        const connectionGroup = this.connectionsGroup.append('g')
            .attr('class', 'flowchart-connection-group')
            .attr('data-connection-id', connectionData.id);
        
        // Create path
        const path = connectionGroup.append('path')
            .attr('class', 'flowchart-connection')
            .attr('d', this.calculateConnectionPath(sourceNode, targetNode))
            .attr('stroke-dasharray', this.getStrokeDashArray(connectionData.style));
        
        // Add label if exists
        if (connectionData.label) {
            const midPoint = this.getConnectionMidPoint(sourceNode, targetNode);
            connectionGroup.append('text')
                .attr('class', 'connection-label')
                .attr('x', midPoint.x)
                .attr('y', midPoint.y - 5)
                .text(connectionData.label);
        }
        
        // Add event handlers
        connectionGroup.on('click', (event) => {
            this.emit('connectionClick', event, connectionData);
        });
        
        // Apply status styling
        this.updateConnectionStatus(connectionData);
        
        return connectionGroup;
    }
    
    calculateConnectionPath(sourceNode, targetNode) {
        const sourceCenter = {
            x: sourceNode.x + sourceNode.width / 2,
            y: sourceNode.y + sourceNode.height / 2
        };
        
        const targetCenter = {
            x: targetNode.x + targetNode.width / 2,
            y: targetNode.y + targetNode.height / 2
        };
        
        // Calculate connection points on node edges
        const sourcePoint = this.getNodeEdgePoint(sourceNode, targetCenter);
        const targetPoint = this.getNodeEdgePoint(targetNode, sourceCenter);
        
        // Create bezier curve
        const controlOffset = Math.abs(targetPoint.x - sourcePoint.x) * 0.3;
        
        return `M ${sourcePoint.x} ${sourcePoint.y} C ${sourcePoint.x + controlOffset} ${sourcePoint.y}, ${targetPoint.x - controlOffset} ${targetPoint.y}, ${targetPoint.x} ${targetPoint.y}`;
    }
    
    getNodeEdgePoint(node, targetPoint) {
        const centerX = node.x + node.width / 2;
        const centerY = node.y + node.height / 2;
        
        const dx = targetPoint.x - centerX;
        const dy = targetPoint.y - centerY;
        
        // Calculate intersection with node boundary based on type
        switch (node.type) {
            case 'start':
            case 'end':
                // Ellipse intersection
                const a = node.width / 2;
                const b = node.height / 2;
                const angle = Math.atan2(dy, dx);
                return {
                    x: centerX + a * Math.cos(angle),
                    y: centerY + b * Math.sin(angle)
                };
                
            case 'decision':
                // Diamond intersection - simplified to rectangle for now
                const halfWidth = node.width / 2;
                const halfHeight = node.height / 2;
                const slope = dy / dx;
                
                if (Math.abs(dx) > Math.abs(dy)) {
                    // Intersect with left or right edge
                    const x = dx > 0 ? centerX + halfWidth : centerX - halfWidth;
                    const y = centerY + slope * (x - centerX);
                    return { x, y: Math.max(centerY - halfHeight, Math.min(centerY + halfHeight, y)) };
                } else {
                    // Intersect with top or bottom edge
                    const y = dy > 0 ? centerY + halfHeight : centerY - halfHeight;
                    const x = centerX + (y - centerY) / slope;
                    return { x: Math.max(centerX - halfWidth, Math.min(centerX + halfWidth, x)), y };
                }
                
            default:
                // Rectangle intersection
                const rectHalfWidth = node.width / 2;
                const rectHalfHeight = node.height / 2;
                
                if (Math.abs(dx) * rectHalfHeight > Math.abs(dy) * rectHalfWidth) {
                    // Intersect with left or right edge
                    const x = dx > 0 ? centerX + rectHalfWidth : centerX - rectHalfWidth;
                    const y = centerY + dy * rectHalfWidth / Math.abs(dx);
                    return { x, y };
                } else {
                    // Intersect with top or bottom edge
                    const y = dy > 0 ? centerY + rectHalfHeight : centerY - rectHalfHeight;
                    const x = centerX + dx * rectHalfHeight / Math.abs(dy);
                    return { x, y };
                }
        }
    }
    
    getConnectionMidPoint(sourceNode, targetNode) {
        const sourceCenter = {
            x: sourceNode.x + sourceNode.width / 2,
            y: sourceNode.y + sourceNode.height / 2
        };
        
        const targetCenter = {
            x: targetNode.x + targetNode.width / 2,
            y: targetNode.y + targetNode.height / 2
        };
        
        return {
            x: (sourceCenter.x + targetCenter.x) / 2,
            y: (sourceCenter.y + targetCenter.y) / 2
        };
    }
    
    getStrokeDashArray(style) {
        switch (style) {
            case 'dashed': return '8,4';
            case 'dotted': return '2,3';
            default: return 'none';
        }
    }
    
    updateNodeConnections(nodeId) {
        // Update all connections involving this node
        const flowchart = window.flowchartEditor.getCurrentFlowchart();
        const connections = flowchart.connections.filter(c => c.from === nodeId || c.to === nodeId);
        
        connections.forEach(connection => {
            this.updateConnection(connection);
        });
    }
    
    updateConnection(connectionData) {
        const sourceNode = window.flowchartEditor.findNodeById(connectionData.from);
        const targetNode = window.flowchartEditor.findNodeById(connectionData.to);
        
        if (!sourceNode || !targetNode) return;
        
        const connectionGroup = this.connectionsGroup.select(`[data-connection-id="${connectionData.id}"]`);
        const path = connectionGroup.select('.flowchart-connection');
        
        path.attr('d', this.calculateConnectionPath(sourceNode, targetNode));
        
        // Update label position
        const label = connectionGroup.select('.connection-label');
        if (!label.empty()) {
            const midPoint = this.getConnectionMidPoint(sourceNode, targetNode);
            label.attr('x', midPoint.x).attr('y', midPoint.y - 5);
        }
    }
    
    updateConnectionLabel(connectionData) {
        const connectionGroup = this.connectionsGroup.select(`[data-connection-id="${connectionData.id}"]`);
        
        // Remove existing label
        connectionGroup.select('.connection-label').remove();
        
        // Add new label if text exists
        if (connectionData.label) {
            const sourceNode = window.flowchartEditor.findNodeById(connectionData.from);
            const targetNode = window.flowchartEditor.findNodeById(connectionData.to);
            const midPoint = this.getConnectionMidPoint(sourceNode, targetNode);
            
            connectionGroup.append('text')
                .attr('class', 'connection-label')
                .attr('x', midPoint.x)
                .attr('y', midPoint.y - 5)
                .text(connectionData.label);
        }
    }
    
    updateConnectionStyle(connectionData) {
        const connectionGroup = this.connectionsGroup.select(`[data-connection-id="${connectionData.id}"]`);
        const path = connectionGroup.select('.flowchart-connection');
        
        path.attr('stroke-dasharray', this.getStrokeDashArray(connectionData.style));
    }
    
    updateConnectionStatus(connectionData) {
        const connectionGroup = this.connectionsGroup.select(`[data-connection-id="${connectionData.id}"]`);
        const status = connectionData.metadata?.status || 'pending';
        
        connectionGroup.classed('approved', status === 'approved')
                     .classed('rejected', status === 'rejected')
                     .classed('pending', status === 'pending');
    }
    
    removeConnection(connectionId) {
        this.connectionsGroup.select(`[data-connection-id="${connectionId}"]`).remove();
    }
    
    // Selection management
    selectElement(element, type) {
        this.clearSelection();
        this.selectedElement = { element, type };
        
        if (type === 'node') {
            this.nodesGroup.select(`[data-node-id="${element.id}"]`).classed('selected', true);
        } else if (type === 'connection') {
            this.connectionsGroup.select(`[data-connection-id="${element.id}"]`).classed('selected', true);
        }
    }
    
    clearSelection() {
        this.nodesGroup.selectAll('.selected').classed('selected', false);
        this.connectionsGroup.selectAll('.selected').classed('selected', false);
        this.selectedElement = null;
    }
    
    // Connection drawing helpers
    startConnectionDraw(fromNode) {
        this.connectionInProgress = {
            fromNode: fromNode,
            line: this.svg.append('line')
                .attr('class', 'connection-preview')
                .attr('x1', fromNode.x + fromNode.width / 2)
                .attr('y1', fromNode.y + fromNode.height / 2)
                .attr('x2', fromNode.x + fromNode.width / 2)
                .attr('y2', fromNode.y + fromNode.height / 2)
                .attr('stroke', '#999')
                .attr('stroke-width', 2)
                .attr('stroke-dasharray', '4,4')
        };
        
        // Track mouse movement
        this.svg.on('mousemove', (event) => {
            if (this.connectionInProgress) {
                const [x, y] = d3.pointer(event, this.mainGroup.node());
                this.connectionInProgress.line
                    .attr('x2', x)
                    .attr('y2', y);
            }
        });
    }
    
    endConnectionDraw() {
        if (this.connectionInProgress) {
            this.connectionInProgress.line.remove();
            this.connectionInProgress = null;
        }
        this.svg.on('mousemove', null);
    }
    
    // Canvas management
    clear() {
        this.nodesGroup.selectAll('*').remove();
        this.connectionsGroup.selectAll('*').remove();
        this.clearSelection();
    }
    
    fitToScreen() {
        const flowchart = window.flowchartEditor.getCurrentFlowchart();
        if (flowchart.nodes.length === 0) return;
        
        const bounds = this.calculateBounds(flowchart.nodes);
        const padding = 50;
        
        const svgRect = this.svg.node().getBoundingClientRect();
        const scale = Math.min(
            svgRect.width / (bounds.width + padding * 2),
            svgRect.height / (bounds.height + padding * 2)
        );
        
        const translateX = (svgRect.width - bounds.width * scale) / 2 - bounds.minX * scale;
        const translateY = (svgRect.height - bounds.height * scale) / 2 - bounds.minY * scale;
        
        const transform = d3.zoomIdentity
            .translate(translateX, translateY)
            .scale(scale);
        
        this.svg.transition().duration(750).call(this.zoom.transform, transform);
    }
    
    resetZoom() {
        this.svg.transition().duration(750).call(this.zoom.transform, d3.zoomIdentity);
    }
    
    calculateBounds(nodes) {
        const xs = nodes.map(n => n.x);
        const ys = nodes.map(n => n.y);
        const widths = nodes.map(n => n.x + n.width);
        const heights = nodes.map(n => n.y + n.height);
        
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...widths);
        const maxY = Math.max(...heights);
        
        return {
            minX,
            minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }
    
    updateZoomLevel(scale) {
        const percentage = Math.round(scale * 100);
        document.getElementById('zoom-level').textContent = `Zoom: ${percentage}%`;
    }
}