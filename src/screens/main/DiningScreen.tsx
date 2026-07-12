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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Restaurant } from '../../types';
import GlassPill from '../../components/ui/GlassPill';
import { useFilteredContent } from '../../hooks/useFilteredContent';
import { handleVenueBooking } from '../../utils/booking';
import { resolveImage } from '../../utils/images';
import { fonts } from '../../theme/fonts';

const { width } = Dimensions.get('window');

type FilterType = 'all' | 'open' | 'live_music' | 'budget' | 'fine_dining';

const DiningScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const { dining: filteredDiningList } = useFilteredContent();

  const filteredRestaurants = useMemo(() => {
    switch (activeFilter) {
      case 'open':
        return filteredDiningList.filter(r => r.isOpen);
      case 'live_music':
        return filteredDiningList.filter(r => r.hasLiveMusic);
      case 'budget':
        return filteredDiningList.filter(r => r.priceRange === '$' || r.priceRange === '$$');
      case 'fine_dining':
        return filteredDiningList.filter(r => r.priceRange === '$$$' || r.priceRange === '$$$$');
      default:
        return filteredDiningList;
    }
  }, [activeFilter, filteredDiningList]);

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  const handleDirections = (address: string) => {
    const query = encodeURIComponent(address);
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {});
    } else {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() => {});
    }
  };

  const renderRestaurantCard = ({ item }: { item: Restaurant }) => {
    const hasDigitalBooking = item.bookingType === 'whatsapp' || item.bookingType === 'external_link';
    const callLabel = item.bookingType === 'whatsapp' ? 'Book via WhatsApp' : item.bookingType === 'external_link' ? 'Book on Website' : 'Call to Book';
    const iconName = item.bookingType === 'whatsapp' ? 'logo-whatsapp' : item.bookingType === 'external_link' ? 'globe-outline' : 'call-outline';
    const iconColor = item.bookingType === 'whatsapp' ? '#25D366' : '#99E1D9';

    const handleBookingClick = async () => {
      if (hasDigitalBooking) {
        await handleVenueBooking(item);
      } else {
        handleCall(item.phone);
      }
    };

    return (
      <View style={styles.restaurantCard}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: resolveImage(item.imageId, item.image, 'medium') }} style={styles.restaurantImage} />
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
              style={styles.retroActionOuter}
              onPress={handleBookingClick}
              activeOpacity={0.8}
            >
              <View style={styles.retroActionInner}>
                <Text style={styles.retroActionText}>{callLabel}</Text>
                <View style={styles.retroActionArrow}>
                  <Ionicons name="arrow-forward" size={12} color="#0A0C12" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.restaurantList}
        style={{ flex: 1 }}
      >
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
          <GlassPill label="All" icon="grid" active={activeFilter === 'all'} onPress={() => setActiveFilter('all')} />
          <GlassPill label="Open Now" icon="time" active={activeFilter === 'open'} onPress={() => setActiveFilter('open')} />
          <GlassPill label="Live Music" icon="musical-notes" active={activeFilter === 'live_music'} onPress={() => setActiveFilter('live_music')} />
          <GlassPill label="Budget" icon="wallet" active={activeFilter === 'budget'} onPress={() => setActiveFilter('budget')} />
          <GlassPill label="Fine Dining" icon="wine" active={activeFilter === 'fine_dining'} onPress={() => setActiveFilter('fine_dining')} />
        </ScrollView>

        {/* Restaurant List */}
        {filteredRestaurants.map((item, index) => (
          <View key={item.id}>
            {index > 0 && <View style={{ height: 16 }} />}
            {renderRestaurantCard({ item })}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    paddingHorizontal: 0,
    gap: 10,
    paddingVertical: 12,
  },

  restaurantList: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 100,
    gap: 0,
  },
  restaurantCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
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
    color: '#FF6B4A',
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
    backgroundColor: 'rgba(255,107,74,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,74,0.3)',
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
    color: '#FF6B4A',
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
    backgroundColor: 'rgba(255,107,74,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,107,74,0.3)',
  },
  callBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B4A',
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
  retroActionOuter: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    borderColor: '#E43414',
    borderRadius: 8,
    padding: 2,
    justifyContent: 'center',
  },
  retroActionInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#E43414',
    borderRadius: 6,
  },
  retroActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#0A0C12',
    fontFamily: fonts.bodyBold,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  retroActionArrow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DiningScreen;
