import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Paper,
} from '@mui/material';
import {
  Person as ProfileIcon,
  Store as MarketplaceIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Payment as BillingIcon,
} from '@mui/icons-material';
import Layout from '../components/Layout';
import MarketplaceSettings from './settings/MarketplaceSettings';
import ProfileSettings from './settings/ProfileSettings';
import NotificationSettings from './settings/NotificationSettings';
import BillingSettings from './settings/BillingSettings';
import SecuritySettings from './settings/SecuritySettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings: React.FC = () => {
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState(0);

  // Check URL query parameter to set initial tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');

    if (tab === 'marketplaces') {
      setCurrentTab(1);
    } else if (tab === 'notifications') {
      setCurrentTab(2);
    } else if (tab === 'billing') {
      setCurrentTab(3);
    } else if (tab === 'security') {
      setCurrentTab(4);
    }
  }, [location.search]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        <Paper sx={{ mt: 3 }}>
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            aria-label="settings tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab icon={<ProfileIcon />} label="Profile" />
            <Tab icon={<MarketplaceIcon />} label="Marketplaces" />
            <Tab icon={<NotificationsIcon />} label="Notifications" />
            <Tab icon={<BillingIcon />} label="Billing" />
            <Tab icon={<SecurityIcon />} label="Security" />
          </Tabs>

          <TabPanel value={currentTab} index={0}>
            <ProfileSettings />
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <MarketplaceSettings />
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <NotificationSettings />
          </TabPanel>

          <TabPanel value={currentTab} index={3}>
            <BillingSettings />
          </TabPanel>

          <TabPanel value={currentTab} index={4}>
            <SecuritySettings />
          </TabPanel>
        </Paper>
      </Container>
    </Layout>
  );
};

export default Settings;
