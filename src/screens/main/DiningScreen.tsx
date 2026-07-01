import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Linking,
  Alert,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { mockRestaurants, filterRestaurants } from '../../services/mockData';
import { Restaurant } from '../../types';
import { fonts } from '../../theme/fonts';

const { width } = Dimensions.get('window');

type FilterType = 'all' | 'open' | 'live_music' | 'budget' | 'fine_dining';

const DiningScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filteredRestaurants = useMemo(() => {
    switch (activeFilter) {
      case 'open':
        return filterRestaurants({ isOpen: true });
      case 'live_music':
        return filterRestaurants({ hasLiveMusic: true });
      case 'budget':
        return mockRestaurants.filter(r => r.priceRange === '$' || r.priceRange === '$$');
      case 'fine_dining':
        return mockRestaurants.filter(r => r.priceRange === '$$$' || r.priceRange === '$$$$');
      default:
        return mockRestaurants;
    }
  }, [activeFilter]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleDirections = (address: string) => {
    const query = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    if (url) {
      Linking.openURL(url);
    } else {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
    }
  };

  const renderFilterChip = (label: string, filter: FilterType, icon: string) => {
    const isActive = activeFilter === filter;
    return (
      <TouchableOpacity
        key={filter}
        style={[styles.filterChip, isActive && styles.filterChipActive]}
        onPress={() => setActiveFilter(filter)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={icon as any}
          size={16}
          color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.6)'}
        />
        <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderRestaurantCard = ({ item }: { item: Restaurant }) => (
    <View style={styles.restaurantCard}>
      {/* Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.restaurantImage} />
        <LinearGradient
          colors={['transparent', 'rgba(10,12,18,0.85)']}
          style={styles.imageGradient}
        />
        
        {/* Open/Closed Status */}
        <View style={[styles.statusBadge, item.isOpen ? styles.statusOpen : styles.statusClosed]}>
          <View style={[styles.statusDot, item.isOpen ? styles.statusDotOpen : styles.statusDotClosed]} />
          <Text style={[styles.statusText, item.isOpen ? styles.statusTextOpen : styles.statusTextClosed]}>
            {item.isOpen ? 'Open Now' : 'Closed'}
          </Text>
        </View>
        
        {/* Price Range */}
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>{item.priceRange}</Text>
        </View>
        
        {/* Rating */}
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
      </View>

      {/* Info */}
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <Text style={styles.restaurantName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cuisineText}>{item.cuisine}</Text>
        </View>

        {/* Location */}
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.5)" />
          <Text style={styles.distanceText}>{item.distance}</Text>
          <Text style={styles.locationDot}>•</Text>
          <Text style={styles.neighborhoodText} numberOfLines={1}>{item.neighborhood}</Text>
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {item.tags.map((tag, index) => (
            <View
              key={index}
              style={[
                styles.tag,
                tag === 'Live Music Tonight' && styles.tagHighlight,
                tag === 'Open Now' && styles.tagOpen,
              ]}
            >
              <Text style={[
                styles.tagText,
                tag === 'Live Music Tonight' && styles.tagTextHighlight,
                tag === 'Open Now' && styles.tagTextOpen,
              ]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>

        {/* Hours */}
        <View style={styles.hoursRow}>
          <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.4)" />
          <Text style={styles.hoursText}>{item.openingHours}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.callBtn]}
            onPress={() => handleCall(item.phone)}
            activeOpacity={0.8}
          >
            <Ionicons name="call-outline" size={18} color="#99E1D9" />
            <Text style={styles.callBtnText}>Call to Book</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionBtn, styles.directionsBtn]}
            onPress={() => handleDirections(item.address)}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate-outline" size={18} color="#FFFFFF" />
            <Text style={styles.directionsBtnText}>Directions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dining</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>Local Restaurants</Text>
        <Text style={styles.restaurantCount}>{filteredRestaurants.length} spots</Text>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {renderFilterChip('All', 'all', 'grid')}
        {renderFilterChip('Open Now', 'open', 'time')}
        {renderFilterChip('Live Music', 'live_music', 'musical-notes')}
        {renderFilterChip('Budget', 'budget', 'wallet')}
        {renderFilterChip('Fine Dining', 'fine_dining', 'wine')}
      </ScrollView>

      {/* Restaurant List */}
      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurantCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.restaurantList}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C12',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.heading,
  },
  headerRight: {
    width: 40,
  },
  subtitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    fontFamily: fonts.body,
  },
  restaurantCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
  filtersContainer: {
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: '#1A1F2B',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  filterChipActive: {
    backgroundColor: '#E43414',
    borderColor: '#E43414',
  },
  filterChipText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    fontFamily: fonts.bodyBold,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
    fontFamily: fonts.bodyBold,
  },
  restaurantList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 16,
  },
  restaurantCard: {
    backgroundColor: '#161B24',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  imageContainer: {
    height: 160,
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusOpen: {
    backgroundColor: 'rgba(52,199,89,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(52,199,89,0.3)',
  },
  statusClosed: {
    backgroundColor: 'rgba(255,69,58,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,69,58,0.3)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotOpen: {
    backgroundColor: '#34C759',
  },
  statusDotClosed: {
    backgroundColor: '#FF453A',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusTextOpen: {
    color: '#34C759',
  },
  statusTextClosed: {
    color: '#FF453A',
  },
  priceBadge: {
    position: 'absolute',
    top: 12,
    right: 52,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priceText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0A0C12',
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.body,
  },
  cardInfo: {
    padding: 16,
  },
  cardHeader: {
    marginBottom: 10,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: fonts.subheading,
  },
  cuisineText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    fontFamily: fonts.body,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  distanceText: {
    fontSize: 13,
    color: '#99E1D9',
    fontWeight: '500',
  },
  locationDot: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
  },
  neighborhoodText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    flex: 1,
    fontFamily: fonts.body,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagHighlight: {
    backgroundColor: 'rgba(153,225,217,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(153,225,217,0.3)',
  },
  tagOpen: {
    backgroundColor: 'rgba(52,199,89,0.12)',
  },
  tagText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  tagTextHighlight: {
    color: '#99E1D9',
  },
  tagTextOpen: {
    color: '#34C759',
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  hoursText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    fontFamily: fonts.body,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
  },
  callBtn: {
    backgroundColor: 'rgba(153,225,217,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(153,225,217,0.3)',
  },
  callBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#99E1D9',
    fontFamily: fonts.bodyBold,
  },
  directionsBtn: {
    backgroundColor: '#E43414',
  },
  directionsBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: fonts.bodyBold,
  },
});

export default DiningScreen;
