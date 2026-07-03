import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useFilteredContent } from '../../hooks/useFilteredContent';
import { handleVenueBooking } from '../../utils/booking';
import { MovieWithShowtimes, Cinema, MovieShowtime } from '../../types';
import { fonts } from '../../theme/fonts';

const { width } = Dimensions.get('window');
const POSTER_WIDTH = (width - 60) / 2;
const POSTER_HEIGHT = POSTER_WIDTH * 1.4;

const CinemaScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [selectedMovie, setSelectedMovie] = useState<MovieWithShowtimes | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<Cinema | null>(null);

  const { cinema: moviesWithShowtimes } = useFilteredContent();

  const handleMoviePress = (movie: MovieWithShowtimes) => {
    setSelectedMovie(movie);
    setSelectedCinema(null);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedMovie(null);
    setSelectedCinema(null);
  };

  const handleSelectCinema = (cinema: Cinema) => {
    setSelectedCinema(cinema);
  };

  const handleSelectShowtime = async (showtime: MovieShowtime) => {
    handleCloseModal();
    if (showtime.bookingType === 'external_link' || showtime.bookingType === 'whatsapp') {
      await handleVenueBooking(showtime);
    } else {
      navigation.navigate('Booking', { eventId: showtime.id });
    }
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const renderMoviePoster = ({ item }: { item: MovieWithShowtimes }) => (
    <TouchableOpacity
      style={styles.posterCard}
      onPress={() => handleMoviePress(item)}
      activeOpacity={0.9}
    >
      <Image source={{ uri: item.poster }} style={styles.posterImage} />
      <LinearGradient
        colors={['transparent', 'rgba(10,12,18,0.9)']}
        locations={[0, 0.6]}
        style={styles.posterGradient}
      />
      
      {/* Format badge */}
      {item.cinemas.some(c => c.showtimes.some(s => s.format === 'IMAX')) && (
        <View style={styles.formatBadge}>
          <Text style={styles.formatBadgeText}>IMAX</Text>
        </View>
      )}
      
      {/* Movie Info */}
      <View style={styles.posterInfo}>
        <Text style={styles.posterTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.posterMeta}>
          <Text style={styles.posterGenre}>{item.genre[0]}</Text>
          <Text style={styles.posterDot}>•</Text>
          <Text style={styles.posterDuration}>{formatDuration(item.duration)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderShowtimeChip = (showtime: MovieShowtime) => {
    const isSelected = selectedCinema?.id === showtime.cinemaId;
    return (
      <TouchableOpacity
        key={showtime.id}
        style={[styles.showtimeChip, !isSelected && styles.showtimeChipInactive]}
        onPress={() => handleSelectShowtime(showtime)}
        activeOpacity={0.8}
      >
        <Text style={[styles.showtimeTime, !isSelected && styles.showtimeTimeInactive]}>
          {showtime.time}
        </Text>
        <View style={styles.showtimeDetails}>
          <Text style={[styles.showtimeFormat, !isSelected && styles.showtimeFormatInactive]}>
            {showtime.format}
          </Text>
          <Text style={[styles.showtimePrice, !isSelected && styles.showtimePriceInactive]}>
            Rs. {showtime.price.toLocaleString('en-PK')}
          </Text>
        </View>
        <Text style={[styles.showtimeSeats, !isSelected && styles.showtimeSeatsInactive]}>
          {showtime.availableSeats} seats
        </Text>
      </TouchableOpacity>
    );
  };

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
        <Text style={styles.headerTitle}>Cinema</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>Now Showing</Text>
        <Text style={styles.movieCount}>{moviesWithShowtimes.length} movies</Text>
      </View>

      {/* Movie Posters Grid */}
      <FlatList
        data={moviesWithShowtimes}
        renderItem={renderMoviePoster}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.posterRow}
        contentContainerStyle={styles.posterList}
        showsVerticalScrollIndicator={false}
        style={styles.flatList}
      />

      {/* Movie Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.modalSafeArea} edges={['top']}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={handleCloseModal} activeOpacity={0.7}>
                <Ionicons name="close" size={28} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                {selectedMovie?.title}
              </Text>
              <View style={{ width: 28 }} />
            </View>

            {selectedMovie && (
              <ScrollView
                style={styles.modalScroll}
                showsVerticalScrollIndicator={false}
              >
                {/* Movie Hero */}
                <View style={styles.movieHero}>
                  <Image source={{ uri: selectedMovie.poster }} style={styles.heroPoster} />
                  <LinearGradient
                    colors={['rgba(10,12,18,0.3)', 'rgba(10,12,18,0.95)']}
                    style={styles.heroGradient}
                  />
                  <View style={styles.heroInfo}>
                    <Text style={styles.heroTitle}>{selectedMovie.title}</Text>
                    <View style={styles.heroMeta}>
                      <View style={styles.ratingBadge}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.ratingText}>{selectedMovie.rating}</Text>
                      </View>
                      <Text style={styles.heroDuration}>{formatDuration(selectedMovie.duration)}</Text>
                      <Text style={styles.heroAgeRating}>{selectedMovie.ageRating}</Text>
                    </View>
                    <View style={styles.genreTags}>
                      {selectedMovie.genre.map((g, i) => (
                        <View key={i} style={styles.genreTag}>
                          <Text style={styles.genreTagText}>{g}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                {/* Synopsis */}
                <View style={styles.synopsisSection}>
                  <Text style={styles.sectionTitle}>Synopsis</Text>
                  <Text style={styles.synopsisText}>{selectedMovie.synopsis}</Text>
                </View>

                {/* Cast & Crew */}
                {selectedMovie.cast.length > 0 && (
                  <View style={styles.castSection}>
                    <Text style={styles.sectionTitle}>Cast</Text>
                    <Text style={styles.castText}>{selectedMovie.cast.join(', ')}</Text>
                    <Text style={styles.directorText}>Director: {selectedMovie.director}</Text>
                  </View>
                )}

                {/* Cinemas & Showtimes */}
                <View style={styles.cinemasSection}>
                  <Text style={styles.sectionTitle}>Select Cinema</Text>
                  
                  {selectedMovie.cinemas.map(({ cinema, showtimes }) => (
                    <TouchableOpacity
                      key={cinema.id}
                      style={[
                        styles.cinemaCard,
                        selectedCinema?.id === cinema.id && styles.cinemaCardActive,
                      ]}
                      onPress={() => handleSelectCinema(cinema)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.cinemaInfo}>
                        <Text style={styles.cinemaName}>{cinema.name}</Text>
                        <View style={styles.cinemaMeta}>
                          <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.5)" />
                          <Text style={styles.cinemaDistance}>{cinema.distance}</Text>
                          <Text style={styles.cinemaDot}>•</Text>
                          <Text style={styles.cinemaNeighborhood}>{cinema.neighborhood}</Text>
                        </View>
                      </View>
                      
                      {/* Showtimes horizontal list */}
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.showtimesList}
                      >
                        {showtimes.map(renderShowtimeChip)}
                      </ScrollView>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            )}
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C12',
  },
  flatList: {
    flex: 1,
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
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.6)',
    fontFamily: fonts.body,
  },
  movieCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
  },
  posterList: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  posterRow: {
    gap: 12,
    marginBottom: 12,
  },
  posterCard: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  posterImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'cover',
  },
  posterGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  formatBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(228,52,20,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  formatBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  posterInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  posterTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 20,
    fontFamily: fonts.subheading,
  },
  posterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  posterGenre: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: fonts.body,
  },
  posterDot: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  posterDuration: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#0A0C12',
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  modalHeaderTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 12,
    fontFamily: fonts.heading,
  },
  modalScroll: {
    flex: 1,
  },
  movieHero: {
    height: 300,
    position: 'relative',
  },
  heroPoster: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  heroInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFD700',
  },
  heroDuration: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  heroAgeRating: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  genreTags: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  genreTag: {
    backgroundColor: 'rgba(255,107,74,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  genreTagText: {
    fontSize: 12,
    color: '#FF6B4A',
    fontWeight: '500',
  },
  synopsisSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  synopsisText: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.7)',
  },
  castSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  castText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 6,
  },
  directorText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
  },
  cinemasSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  cinemaCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  cinemaCardActive: {
    borderColor: 'rgba(255,107,74,0.4)',
    backgroundColor: 'rgba(255,107,74,0.05)',
  },
  cinemaInfo: {
    marginBottom: 12,
  },
  cinemaName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 6,
    fontFamily: fonts.subheading,
  },
  cinemaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cinemaDistance: {
    fontSize: 13,
    color: '#FF6B4A',
    fontWeight: '500',
    fontFamily: fonts.body,
  },
  cinemaDot: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
  },
  cinemaNeighborhood: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  showtimesList: {
    gap: 8,
  },
  showtimeChip: {
    backgroundColor: '#FF6B4A',
    borderRadius: 10,
    padding: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  showtimeChipInactive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  showtimeTime: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0A0C12',
    marginBottom: 4,
    fontFamily: fonts.bodyBold,
  },
  showtimeTimeInactive: {
    color: '#FFFFFF',
  },
  showtimeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  showtimeFormat: {
    fontSize: 11,
    fontWeight: '500',
    color: '#0A0C12',
    opacity: 0.7,
  },
  showtimeFormatInactive: {
    color: 'rgba(255,255,255,0.5)',
    opacity: 1,
  },
  showtimePrice: {
    fontSize: 11,
    fontWeight: '500',
    color: '#0A0C12',
    opacity: 0.7,
  },
  showtimePriceInactive: {
    color: 'rgba(255,255,255,0.5)',
    opacity: 1,
  },
  showtimeSeats: {
    fontSize: 10,
    color: '#0A0C12',
    opacity: 0.6,
  },
  showtimeSeatsInactive: {
    color: 'rgba(255,255,255,0.3)',
    opacity: 1,
  },
});

export default CinemaScreen;
