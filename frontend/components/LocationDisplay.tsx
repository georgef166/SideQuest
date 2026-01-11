'use client';

import { useState, useEffect } from 'react';

interface LocationDisplayProps {
    lat: number;
    lng: number;
    className?: string;
    showCoordinates?: boolean;
}

export default function LocationDisplay({ lat, lng, className = '', showCoordinates = true }: LocationDisplayProps) {
    const [address, setAddress] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchAddress = async () => {
            if (!window.google || !window.google.maps) {
                // Retry if Google Maps not loaded yet
                setTimeout(fetchAddress, 500);
                return;
            }

            const geocoder = new window.google.maps.Geocoder();
            const location = { lat, lng };

            try {
                geocoder.geocode({ location }, (results: any, status: any) => {
                    if (!isMounted) return;

                    if (status === 'OK' && results[0]) {
                        // Use the full formatted address
                        setAddress(results[0].formatted_address);
                    }
                    setLoading(false);
                });
            } catch (error) {
                console.error('Error fetching address:', error);
                if (isMounted) setLoading(false);
            }
        };

        fetchAddress();

        return () => {
            isMounted = false;
        };
    }, [lat, lng]);

    if (!address) {
        return <span className={className}>Loading address...</span>;
    }

    return (
        <span className={className}>
            {address}
        </span>
    );
}
