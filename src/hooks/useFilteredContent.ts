import { useMemo } from 'react';
import { useApp } from '../store';
import { MovieWithShowtimes, Cinema, MovieShowtime } from '../types';

export const useFilteredContent = () => {
  const userSelectedCity = useApp(state => state.userSelectedCity);
  const events = useApp(state => state.events);
  const movies = useApp(state => state.movies);
  const restaurants = useApp(state => state.restaurants);
  const cinemas = useApp(state => state.cinemas);
  const showtimes = useApp(state => state.showtimes);

  const filteredEvents = useMemo(() => {
    return events.filter(e => e.city?.toLowerCase() === userSelectedCity.toLowerCase());
  }, [events, userSelectedCity]);

  const filteredDining = useMemo(() => {
    return restaurants.filter(r => r.city?.toLowerCase() === userSelectedCity.toLowerCase());
  }, [restaurants, userSelectedCity]);

  const filteredCinema = useMemo<MovieWithShowtimes[]>(() => {
    const localCinemas = cinemas.filter(c => c.city?.toLowerCase() === userSelectedCity.toLowerCase());
    const localCinemaIds = localCinemas.map(c => c.id);
    const localShowtimes = showtimes.filter(s => localCinemaIds.includes(s.cinemaId));
    const localMovieIds = Array.from(new Set(localShowtimes.map(s => s.movieId)));
    const localMovies = movies.filter(m => localMovieIds.includes(m.id));

    return localMovies.map(movie => {
      const movieShowtimes = localShowtimes.filter(s => s.movieId === movie.id);
      const cinemaMap = new Map<string, { cinema: Cinema; showtimes: MovieShowtime[] }>();
      
      movieShowtimes.forEach(showtime => {
        const cinema = localCinemas.find(c => c.id === showtime.cinemaId);
        if (!cinema) return;
        
        const existing = cinemaMap.get(showtime.cinemaId);
        if (existing) {
          existing.showtimes.push(showtime);
        } else {
          cinemaMap.set(showtime.cinemaId, {
            cinema,
            showtimes: [showtime],
          });
        }
      });
      
      return {
        ...movie,
        cinemas: Array.from(cinemaMap.values()),
      };
    });
  }, [movies, cinemas, showtimes, userSelectedCity]);

  const filteredPlay = useMemo(() => {
    return events.filter(e => 
      (e.category?.toLowerCase() === 'sports' || e.category?.toLowerCase() === 'play') &&
      e.city?.toLowerCase() === userSelectedCity.toLowerCase()
    );
  }, [events, userSelectedCity]);

  return {
    events: filteredEvents,
    dining: filteredDining,
    cinema: filteredCinema,
    play: filteredPlay,
    userSelectedCity,
  };
};
export default useFilteredContent;
