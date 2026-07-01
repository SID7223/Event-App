import { Linking, Alert } from 'react-native';

export const handleVenueBooking = async (item: {
  bookingType?: 'external_link' | 'whatsapp' | 'in_app';
  externalLink?: string | null;
  whatsappNumber?: string | null;
  title?: string;
}) => {
  if (!item.bookingType || item.bookingType === 'in_app') {
    return 'in_app';
  }

  if (item.bookingType === 'external_link') {
    if (item.externalLink) {
      try {
        const supported = await Linking.canOpenURL(item.externalLink);
        if (supported) {
          await Linking.openURL(item.externalLink);
          return 'external_link';
        } else {
          Alert.alert('Error', 'Cannot open the booking link on this device.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open the booking link.');
      }
    } else {
      Alert.alert('Error', 'Booking link is not available.');
    }
    return 'error';
  }

  if (item.bookingType === 'whatsapp') {
    if (item.whatsappNumber) {
      const text = encodeURIComponent("Hi! I found your venue on Zyntr. Are there any slots available for this week?");
      const cleanNumber = item.whatsappNumber.replace(/[\s-]/g, '');
      const waUrl = `https://wa.me/${cleanNumber}?text=${text}`;
      
      try {
        const supported = await Linking.canOpenURL(waUrl);
        if (supported) {
          await Linking.openURL(waUrl);
          return 'whatsapp';
        } else {
          Alert.alert('Error', 'WhatsApp is not installed or cannot be opened on this device.');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to open WhatsApp.');
      }
    } else {
      Alert.alert('Error', 'WhatsApp number is not available.');
    }
    return 'error';
  }

  return 'in_app';
};

export const getBookingButtonLabel = (item: {
  category?: string;
  bookingType?: 'external_link' | 'whatsapp' | 'in_app';
  externalLink?: string | null;
  dataSource?: string;
  price?: number;
}) => {
  if (item.bookingType === 'whatsapp') {
    return 'Book via WhatsApp';
  }
  
  if (item.bookingType === 'external_link') {
    if (item.category?.toLowerCase() === 'cinema' || item.dataSource === 'bookme' || item.externalLink?.includes('bookme')) {
      return 'View Showtimes on Bookme';
    }
    if (item.dataSource === 'ticketwala' || item.dataSource === 'bookme' || item.externalLink?.includes('ticketwala') || item.externalLink?.includes('bookme')) {
      return 'Buy Tickets on Website';
    }
    return 'Buy Tickets on Website';
  }
  
  return item.price === 0 ? "RSVP / I'm Going" : 'Get Tickets';
};
