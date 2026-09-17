import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StatusBar as NativeStatusBar,
  Text,
  View,
  useColorScheme,
} from 'react-native';

import { resolveRoles, roleWorkspaces } from '../config/roleAccess';
import { PrimaryButton } from '../components/PrimaryButton';
import { usePilotStatus } from '../hooks/usePilotStatus';
import { getPalette } from '../theme/palette';
import { createStyles } from './PosHomeScreen.styles';

interface PosHomeScreenProps {
  firstName?: string;
  roles?: string[];
  onSignOut?: () => Promise<void>;
}

export function PosHomeScreen({ firstName, roles = [], onSignOut }: PosHomeScreenProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const colorScheme = useColorScheme();
  const mode = colorScheme === 'dark' ? 'dark' : 'light';
  const palette = useMemo(() => getPalette(mode), [mode]);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const status = usePilotStatus();
  const statusBarOffset = Platform.OS === 'android' ? (NativeStatusBar.currentHeight ?? 0) : 0;
  const allowedRoles = resolveRoles(roles);
  const visibleWorkspaces = roleWorkspaces.filter((workspace) =>
    allowedRoles.includes(workspace.role),
  );
  const firstRowWorkspaces = visibleWorkspaces.slice(0, 2);
  const secondRowWorkspaces = visibleWorkspaces.slice(2, 5);

  const greetingName = firstName?.trim() ? firstName.trim() : 'Operator';

  return (
    <View style={[styles.safeArea, { paddingTop: statusBarOffset }]}>
      <StatusBar
        style={mode === 'dark' ? 'light' : 'dark'}
        translucent={false}
        backgroundColor={palette.background}
      />
      <View style={styles.screenShell}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.topSection}>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <View style={styles.brandRing} />
              </View>
              <View style={styles.brandTextWrap}>
                <Text style={styles.brandName}>The Oval</Text>
                <Text style={styles.brandSubline}>Where Hospitality Begins.</Text>
              </View>
              <Pressable onPress={() => setSidebarOpen(true)} style={styles.menuChip}>
                <Text style={styles.menuChipText}>Menu</Text>
              </Pressable>
            </View>

            <Text style={styles.greetingTitle}>Welcome, {greetingName}</Text>
            <Text style={styles.greetingBody}>Choose your workspace to jump in quickly.</Text>
          </View>

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
                    <Pressable key={workspace.key} style={styles.workspaceCardTwo}>
                      <Text style={styles.workspaceTitle}>{workspace.title}</Text>
                      <Text style={styles.workspaceSummary}>{workspace.summary}</Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.workspaceRowThree}>
                  {secondRowWorkspaces.map((workspace) => (
                    <Pressable key={workspace.key} style={styles.workspaceCardThree}>
                      <Text style={styles.workspaceTitle}>{workspace.title}</Text>
                      <Text style={styles.workspaceSummary}>{workspace.summary}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.workspaceCardTwo}>
                <Text style={styles.workspaceTitle}>No workspace assigned</Text>
                <Text style={styles.workspaceSummary}>
                  Contact admin to grant one of these roles: Admin, Front-desk, Accounting, Sales,
                  Inventory.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.stateBanner}>
            <View style={styles.stateBadgeWrap}>
              <Text style={styles.stateBadge}>{status.isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
              <Text style={styles.stateBadgeAlt}>
                {status.isSyncReady ? 'SYNC READY' : 'SYNC BLOCKED'}
              </Text>
            </View>
            <Text style={styles.stateBody}>{status.message}</Text>
          </View>

          <View style={styles.footerActions}>
            <PrimaryButton label="Continue" />
            <PrimaryButton label="Sign Out" onPress={onSignOut} />
          </View>
        </ScrollView>

        <View style={styles.bottomNav}>
          <Pressable style={styles.bottomNavItem}>
            <Text style={styles.bottomNavIcon}>H</Text>
            <Text style={styles.bottomNavTextActive}>Home</Text>
          </Pressable>
          <Pressable style={styles.bottomNavItem}>
            <Text style={styles.bottomNavIcon}>S</Text>
            <Text style={styles.bottomNavText}>Sales</Text>
          </Pressable>
          <Pressable style={styles.bottomNavItem}>
            <Text style={styles.bottomNavIcon}>I</Text>
            <Text style={styles.bottomNavText}>Inventory</Text>
          </Pressable>
          <Pressable style={styles.bottomNavItem}>
            <Text style={styles.bottomNavIcon}>R</Text>
            <Text style={styles.bottomNavText}>Reports</Text>
          </Pressable>
          <Pressable style={styles.bottomNavItem} onPress={() => setSidebarOpen(true)}>
            <Text style={styles.bottomNavIcon}>M</Text>
            <Text style={styles.bottomNavText}>More</Text>
          </Pressable>
        </View>
      </View>

      {isSidebarOpen ? (
        <View style={styles.sidebarLayer}>
          <Pressable style={styles.sidebarBackdrop} onPress={() => setSidebarOpen(false)} />
          <View style={styles.sidebarPanel}>
            <Text style={styles.sidebarTitle}>Workspace Menu</Text>
            <Text style={styles.sidebarSubtitle}>The Oval</Text>

            {visibleWorkspaces.length > 0 ? (
              visibleWorkspaces.map((workspace) => (
                <Pressable key={workspace.key} style={styles.sidebarItem}>
                  <Text style={styles.sidebarItemTitle}>{workspace.title}</Text>
                  <Text style={styles.sidebarItemBody}>{workspace.role}</Text>
                </Pressable>
              ))
            ) : (
              <View style={styles.sidebarItem}>
                <Text style={styles.sidebarItemTitle}>No role access yet</Text>
                <Text style={styles.sidebarItemBody}>Please contact an administrator.</Text>
              </View>
            )}

            <PrimaryButton
              label="Close Menu"
              onPress={() => setSidebarOpen(false)}
              variant="outline"
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}
