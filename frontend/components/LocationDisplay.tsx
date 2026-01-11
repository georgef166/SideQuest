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
                        let city = '';
                        let province = '';
                        let postalCode = '';

                        for (const component of results[0].address_components) {
                            const types = component.types;
                            if (types.includes('locality')) {
                                city = component.long_name;
                            } else if (types.includes('administrative_area_level_1')) {
                                province = component.short_name; // Use short name (e.g., ON)
                            } else if (types.includes('postal_code')) {
                                postalCode = component.long_name;
                            }
                        }

                        const parts = [city, province, postalCode].filter(part => part);
                        if (parts.length > 0) {
                            setAddress(parts.join(', '));
                        } else {
                            setAddress(results[0].formatted_address);
                        }
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

    const coordsString = `(${lat.toFixed(4)}, ${lng.toFixed(4)})`;

    if (loading) {
        return <span className={className}>Loading location...</span>;
    }

    if (!address) {
        return <span className={className}>{coordsString}</span>;
    }

    return (
        <span className={className}>
            {address} {showCoordinates && coordsString}
        </span>
    );
}
