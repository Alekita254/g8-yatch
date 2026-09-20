import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar as NativeStatusBar,
  Text,
  View,
} from 'react-native';

import { resolveRoles, roleWorkspaces } from '../config/roleAccess';
import { PosBottomNav } from '../components/PosBottomNav';
import { PosHomeTopSection } from '../components/PosHomeTopSection';
import { PosWorkspaceSidebar } from '../components/PosWorkspaceSidebar';
import { AdminOverviewScreen } from './AdminOverviewScreen';
import { getPalette } from '../theme/palette';
import { createStyles } from './PosHomeScreen.styles';

interface PosHomeScreenProps {
  firstName?: string;
  roles?: string[];
  onSignOut?: () => Promise<void>;
}

export function PosHomeScreen({ firstName, roles = [], onSignOut }: PosHomeScreenProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState<'home' | 'admin'>('home');
  const palette = useMemo(() => getPalette('light'), []);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const statusBarOffset = Platform.OS === 'android' ? (NativeStatusBar.currentHeight ?? 0) : 0;
  const allowedRoles = resolveRoles(roles);
  const visibleWorkspaces = roleWorkspaces.filter((workspace) =>
    allowedRoles.includes(workspace.role),
  );
  const firstRowWorkspaces = visibleWorkspaces.slice(0, 2);
  const secondRowWorkspaces = visibleWorkspaces.slice(2, 5);
  const homeMenuItems = [
    { key: 'settings', title: 'Settings', icon: 'settings-outline' as const },
    { key: 'notifications', title: 'Notifications', icon: 'notifications-outline' as const },
    { key: 'profile', title: 'Profile', icon: 'person-outline' as const },
  ];

  const greetingName = firstName?.trim() ? firstName.trim() : 'Operator';
  void onSignOut;

  const handleWorkspacePress = (role: string) => {
    if (role === 'Admin') {
      setActiveWorkspace('admin');
    }
  };

  if (activeWorkspace === 'admin') {
    return <AdminOverviewScreen onBack={() => setActiveWorkspace('home')} />;
  }

  return (
    <View style={[styles.safeArea, { paddingTop: statusBarOffset }]}> 
      <NativeStatusBar
        barStyle="dark-content"
        translucent={false}
        backgroundColor={palette.background}
      />
      <View style={styles.screenShell}>
        <ScrollView contentContainerStyle={styles.container}>
          <PosHomeTopSection
            palette={palette}
            greetingName={greetingName}
            onMenuPress={() => setSidebarOpen(true)}
          />

          <View style={styles.rolesWrap}>
            {allowedRoles.map((role) => (
              <View key={role} style={styles.roleChip}>
                <Text style={styles.roleChipText}>{role}</Text>
              </View>
            ))}
          </View>

          <View style={styles.workspaceGridWrap}>
            {visibleWorkspaces.length > 0 ? (
              <>
                <View style={styles.workspaceRowTwo}>
                  {firstRowWorkspaces.map((workspace) => (
                    <Pressable
                      key={workspace.key}
                      style={styles.workspaceCardTwo}
                      onPress={() => handleWorkspacePress(workspace.role)}
                    >
                      <View style={styles.workspaceIconWrap}>
                        <Ionicons
                          name={
                            workspace.role === 'Admin'
                              ? 'shield-checkmark-outline'
                              : workspace.role === 'Front-desk'
                                ? 'bed-outline'
                                : workspace.role === 'Accounting'
                                  ? 'receipt-outline'
                                  : workspace.role === 'Sales'
                                    ? 'cart-outline'
                                    : 'cube-outline'
                          }
                          size={22}
                          color={palette.brand}
                        />
                      </View>
                      <Text style={styles.workspaceTitle}>{workspace.title}</Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.workspaceRowThree}>
                  {secondRowWorkspaces.map((workspace) => (
                    <Pressable
                      key={workspace.key}
                      style={styles.workspaceCardThree}
                      onPress={() => handleWorkspacePress(workspace.role)}
                    >
                      <View style={styles.workspaceIconWrapCompact}>
                        <Ionicons
                          name={
                            workspace.role === 'Admin'
                              ? 'shield-checkmark-outline'
                              : workspace.role === 'Front-desk'
                                ? 'bed-outline'
                                : workspace.role === 'Accounting'
                                  ? 'receipt-outline'
                                  : workspace.role === 'Sales'
                                    ? 'cart-outline'
                                    : 'cube-outline'
                          }
                          size={18}
                          color={palette.brand}
                        />
                      </View>
                      <Text style={styles.workspaceTitle}>{workspace.title}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.workspaceCardTwo}>
                <Text style={styles.workspaceTitle}>No workspace assigned</Text>
              </View>
            )}
          </View>

        </ScrollView>

        <PosBottomNav
          palette={palette}
          workspace="home"
          onMenuPress={() => setSidebarOpen(true)}
        />
      </View>

      <PosWorkspaceSidebar
        isOpen={isSidebarOpen}
        palette={palette}
        workspace="home"
        items={homeMenuItems}
        onClose={() => setSidebarOpen(false)}
      />
    </View>
  );
}
