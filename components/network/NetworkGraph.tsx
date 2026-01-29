'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';
import { NetworkNode, NetworkEdge } from '@/types';
import { getRiskColor } from '@/lib/colors';
import { Card } from '@/components/ui/card';

interface NetworkGraphProps {
  nodes: NetworkNode[];
  edges: NetworkEdge[];
  width?: number;
  height?: number;
  onNodeClick?: (node: NetworkNode) => void;
  selectedNode?: string | null;
}

// Extended node type for D3 simulation
interface SimulationNode extends NetworkNode {
  fx?: number | null;
  fy?: number | null;
}

export function NetworkGraph({
  nodes,
  edges,
  width = 800,
  height = 600,
  onNodeClick,
  selectedNode,
}: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  // Handle responsive sizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: Math.max(400, rect.height),
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const renderGraph = useCallback(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const g = svg.append('g');

    // Convert nodes to simulation nodes
    const simulationNodes: SimulationNode[] = nodes.map(n => ({ ...n }));

    // Create force simulation
    const simulation = d3.forceSimulation<SimulationNode>(simulationNodes)
      .force('link', d3.forceLink<SimulationNode, NetworkEdge>(edges)
        .id((d) => d.id)
        .distance(100)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // Create links
    const link = g.append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(edges)
      .join('line')
      .attr('stroke-width', (d) => Math.sqrt(d.weight) * 2);

    // Create nodes
    const node = g.append('g')
      .selectAll('g')
      .data(simulationNodes)
      .join('g')
      .attr('cursor', 'pointer');

    // Add drag behavior
    const dragBehavior = d3.drag<SVGGElement, SimulationNode>()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    node.call(dragBehavior as any);

    // Add circles to nodes
    node.append('circle')
      .attr('r', (d) => 10 + d.betweenness * 20)
      .attr('fill', (d) => getRiskColor(d.risk_level).hex)
      .attr('stroke', (d) => d.is_hidden_gem ? '#fbbf24' : '#fff')
      .attr('stroke-width', (d) => d.is_hidden_gem ? 4 : 2)
      .attr('class', (d) =>
        selectedNode === d.id ? 'ring-4 ring-blue-400' : ''
      );

    // Add labels to nodes
    node.append('text')
      .text((d) => d.user_hash.slice(0, 8))
      .attr('x', 15)
      .attr('y', 4)
      .attr('font-size', '10px')
      .attr('fill', '#374151')
      .attr('font-family', 'sans-serif');

    // Add hidden gem indicator
    node.filter((d) => d.is_hidden_gem)
      .append('text')
      .text('💎')
      .attr('x', -6)
      .attr('y', -15)
      .attr('font-size', '12px');

    // Handle click events
    node.on('click', (_event, d) => {
      onNodeClick?.(d);
    });

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => (d.source as SimulationNode).x || 0)
        .attr('y1', (d: any) => (d.source as SimulationNode).y || 0)
        .attr('x2', (d: any) => (d.target as SimulationNode).x || 0)
        .attr('y2', (d: any) => (d.target as SimulationNode).y || 0);

      node.attr('transform', (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, dimensions, onNodeClick, selectedNode]);

  useEffect(() => {
    renderGraph();
  }, [renderGraph]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full min-h-[400px]"
    >
      <Card className="w-full h-full overflow-hidden">
        <svg
          ref={svgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="w-full h-full"
        />
      </Card>
    </motion.div>
  );
}
