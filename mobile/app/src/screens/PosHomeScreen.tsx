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
import { getPalette } from '../theme/palette';
import { createStyles } from './PosHomeScreen.styles';

interface PosHomeScreenProps {
  firstName?: string;
  roles?: string[];
  onSignOut?: () => Promise<void>;
}

export function PosHomeScreen({ firstName, roles = [], onSignOut }: PosHomeScreenProps) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const palette = useMemo(() => getPalette('light'), []);
  const styles = useMemo(() => createStyles(palette), [palette]);
  const statusBarOffset = Platform.OS === 'android' ? (NativeStatusBar.currentHeight ?? 0) : 0;
  const allowedRoles = resolveRoles(roles);
  const visibleWorkspaces = roleWorkspaces.filter((workspace) =>
    allowedRoles.includes(workspace.role),
  );
  const firstRowWorkspaces = visibleWorkspaces.slice(0, 2);
  const secondRowWorkspaces = visibleWorkspaces.slice(2, 5);

  const greetingName = firstName?.trim() ? firstName.trim() : 'Operator';
  void onSignOut;

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
                    <Pressable key={workspace.key} style={styles.workspaceCardTwo}>
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
                    <Pressable key={workspace.key} style={styles.workspaceCardThree}>
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

        <PosBottomNav palette={palette} />
      </View>

      <PosWorkspaceSidebar
        isOpen={isSidebarOpen}
        palette={palette}
        onClose={() => setSidebarOpen(false)}
      />
    </View>
  );
}
