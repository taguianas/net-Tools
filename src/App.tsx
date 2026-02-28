import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Layout from './Layout';
import Dashboard from './Pages/Dashboard';
import SubnetCalculator from './Pages/SubnetCalculator.tsx';
import VLSMPlanner from './Pages/VLSMPlanner.tsx';
import CIDRAggregator from './Pages/CIDRAggregator.tsx';
import IPUtilities from './Pages/IPUtilities.tsx';
import BinaryConverter from './Pages/BinaryConverter.tsx';
import VLANPlanner from './Pages/VLANPlanner.tsx';
import MTUCalculator from './Pages/MTUCalculator.tsx';
import BandwidthCalculator from './Pages/BandwidthCalculator.tsx';
import QoSCalculator from './Pages/QoSCalculator.tsx';
import PacketAnalyzer from './Pages/PacketAnalyzer.tsx';
import RoutingCalculator from './Pages/RoutingCalculator.tsx';
import WifiAnalyzer from './Pages/WifiAnalyzer.tsx';
import IPv6Generator from './Pages/IPv6Generator.tsx';
import PortScanner from './Pages/PortScanner.tsx';
import DNSLookup from './Pages/DNSLookup.tsx';
import PingTool from './Pages/PingTool.tsx';
import ACLBuilder from './Pages/ACLBuilder.tsx';
import PasswordTools from './Pages/PasswordTools.tsx';
import VisualSubnetMap from './Pages/VisualSubnetMap.tsx';
import MACLookup from './Pages/MACLookup.tsx';
import PortReference from './Pages/PortReference.tsx';
import Documentation from './Pages/Documentation.tsx';
import ConfigTemplates from './Pages/ConfigTemplates.tsx';
import BatchProcessor from './Pages/BatchProcessor.tsx';
import Troubleshooting from './Pages/Troubleshooting.tsx';
import Settings from './Pages/Settings.tsx';
import About from './Pages/About.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            {/* Core Tools */}
            <Route path="subnet-calculator" element={<SubnetCalculator />} />
            <Route path="vlsm-planner" element={<VLSMPlanner />} />
            <Route path="cidr-aggregator" element={<CIDRAggregator />} />
            <Route path="ip-utilities" element={<IPUtilities />} />
            <Route path="binary-converter" element={<BinaryConverter />} />
            {/* Planning */}
            <Route path="vlan-planner" element={<VLANPlanner />} />
            <Route path="mtu-calculator" element={<MTUCalculator />} />
            <Route path="bandwidth-calculator" element={<BandwidthCalculator />} />
            <Route path="qo-s-calculator" element={<QoSCalculator />} />
            <Route path="packet-analyzer" element={<PacketAnalyzer />} />
            <Route path="routing-calculator" element={<RoutingCalculator />} />
            <Route path="wifi-analyzer" element={<WifiAnalyzer />} />
            <Route path="i-pv6-generator" element={<IPv6Generator />} />
            {/* Testing */}
            <Route path="port-scanner" element={<PortScanner />} />
            <Route path="dns-lookup" element={<DNSLookup />} />
            <Route path="ping-tool" element={<PingTool />} />
            {/* Security */}
            <Route path="acl-builder" element={<ACLBuilder />} />
            <Route path="password-tools" element={<PasswordTools />} />
            {/* Visualization */}
            <Route path="visual-subnet-map" element={<VisualSubnetMap />} />
            {/* Reference */}
            <Route path="mac-lookup" element={<MACLookup />} />
            <Route path="port-reference" element={<PortReference />} />
            <Route path="documentation" element={<Documentation />} />
            <Route path="config-templates" element={<ConfigTemplates />} />
            {/* Utilities */}
            <Route path="batch-processor" element={<BatchProcessor />} />
            <Route path="troubleshooting" element={<Troubleshooting />} />
            {/* Settings & About */}
            <Route path="settings" element={<Settings />} />
            <Route path="about" element={<About />} />
            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
