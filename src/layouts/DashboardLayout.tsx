import React, { ReactNode } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface DashboardLayoutProps {
    children: ReactNode;
    activeRoute: string;
}

export default function DashboardLayout({ children, activeRoute }: DashboardLayoutProps) {
    const navigation = useNavigation<any>();

    return (
        <View className="flex-1 flex-row bg-agri-bg">
            {/* Sidebar: Persistent on Desktop Web */}
            {Platform.OS === 'web' && (
                <View className="hidden md:flex w-64 bg-agri-dark flex-col justify-between shadow-floating z-10 h-full">
                    <View className="p-6">
                        <View className="flex-row items-center mb-10">
                            <Ionicons name="leaf" size={28} color="#10B981" />
                            <Text className="text-white font-bold text-2xl ml-3 tracking-wide">Farm Sutra</Text>
                        </View>

                        <View className="space-y-4">
                            <SidebarItem
                                icon="cart"
                                label="Mandi Markets"
                                isActive={activeRoute === 'Mandi'}
                                onPress={() => navigation.navigate('Mandi')}
                            />
                            <SidebarItem
                                icon="hardware-chip"
                                label="Farm Sutra AI"
                                isActive={activeRoute === 'Farm Sutra AI'}
                                onPress={() => navigation.navigate('Farm Sutra AI')}
                            />
                            <SidebarItem
                                icon="bar-chart"
                                label="Credit Intel"
                                isActive={activeRoute === 'Credit'}
                                onPress={() => navigation.navigate('Credit')}
                            />
                            <SidebarItem
                                icon="partly-sunny"
                                label="Smart Weather"
                                isActive={activeRoute === 'Mausam'}
                                onPress={() => navigation.navigate('Mausam')}
                            />
                        </View>
                    </View>

                    <View className="p-6 border-t border-emerald-800">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-agri-primary rounded-full items-center justify-center">
                                <Text className="text-white font-bold text-lg">PJ</Text>
                            </View>
                            <View className="ml-3">
                                <Text className="text-white font-semibold">Prakshal</Text>
                                <Text className="text-emerald-300 text-xs">Team Aorta</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* Main Content Area */}
            <View className="flex-1 flex-col h-full">
                {/* Top Header - Contextual Actions */}
                <View className="h-20 bg-agri-surface flex-row items-center justify-between px-6 shadow-sm z-0 border-b border-gray-100">
                    <TouchableOpacity className="md:hidden">
                        <Ionicons name="menu" size={28} color="#064E3B" />
                    </TouchableOpacity>

                    <View className="flex-1 items-end">
                        <View className="flex-row items-center bg-agri-light px-4 py-2 rounded-full border border-emerald-200">
                            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                            <Text className="text-agri-dark font-bold ml-2">Trust Score: Verified</Text>
                        </View>
                    </View>
                </View>

                {/* Dynamic Page Injection */}
                <ScrollView className="flex-1 p-4 md:p-8" showsVerticalScrollIndicator={false}>
                    {children}
                </ScrollView>
            </View>
        </View>
    );
}

const SidebarItem = ({ icon, label, isActive, onPress }: { icon: any, label: string, isActive: boolean, onPress: () => void }) => (
    <TouchableOpacity
        onPress={onPress}
        className={`flex-row items-center px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-agri-primary shadow-md' : 'hover:bg-emerald-800/50'
            }`}
    >
        <Ionicons name={icon} size={22} color={isActive ? '#FFFFFF' : '#A7F3D0'} />
        <Text className={`ml-4 text-sm font-bold ${isActive ? 'text-white' : 'text-emerald-100'}`}>
            {label}
        </Text>
    </TouchableOpacity>
);