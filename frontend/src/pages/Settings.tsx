import React, { useState } from 'react';
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
  const [currentTab, setCurrentTab] = useState(0);

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
            <Box>
              <Typography variant="h6" gutterBottom>
                Profile Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your profile information, email, and password.
              </Typography>
              {/* TODO: Add profile settings form */}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Profile settings coming soon...
                </Typography>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <MarketplaceSettings />
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Notification Preferences
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Choose what notifications you want to receive.
              </Typography>
              {/* TODO: Add notification settings */}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Notification preferences coming soon...
                </Typography>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={currentTab} index={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Billing & Subscription
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your subscription plan and payment methods.
              </Typography>
              {/* TODO: Add billing settings */}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Billing settings coming soon...
                </Typography>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={currentTab} index={4}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your account security and privacy settings.
              </Typography>
              {/* TODO: Add security settings */}
              <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Security settings coming soon...
                </Typography>
              </Box>
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </Layout>
  );
};

export default Settings;
