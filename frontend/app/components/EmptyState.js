import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, DIMENSIONS } from '../utils/constants';

const EmptyState = ({ 
  title, 
  subtitle, 
  icon, 
  actionText, 
  onAction,
  iconSize = 64 
}) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        style={styles.card}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Ionicons 
            name={icon} 
            size={iconSize} 
            color={COLORS.PRIMARY_GRADIENT[0]} 
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* Action Button */}
          {actionText && onAction && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onAction}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={COLORS.PRIMARY_GRADIENT}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.actionText}>{actionText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DIMENSIONS.PADDING.XL,
    minHeight: 400,
  },
  card: {
    alignItems: 'center',
    padding: DIMENSIONS.PADDING.XL,
    borderRadius: DIMENSIONS.BORDER_RADIUS.XXL,
    borderWidth: 1,
    borderColor: COLORS.GLASS_BORDER,
    backgroundColor: COLORS.GLASS_BACKGROUND,
    maxWidth: 320,
    width: '100%',
  },
  iconContainer: {
    marginBottom: DIMENSIONS.PADDING.LG,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: DIMENSIONS.FONT_SIZES.XL,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: DIMENSIONS.PADDING.SM,
  },
  subtitle: {
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    color: COLORS.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: DIMENSIONS.PADDING.LG,
  },
  actionButton: {
    borderRadius: DIMENSIONS.BORDER_RADIUS.LG,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingHorizontal: DIMENSIONS.PADDING.XL,
    paddingVertical: DIMENSIONS.PADDING.MD,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: DIMENSIONS.FONT_SIZES.MD,
    fontWeight: 'bold',
    color: COLORS.TEXT_PRIMARY,
  },
});

export default EmptyState;
