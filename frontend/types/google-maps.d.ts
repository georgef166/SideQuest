// Google Maps JavaScript API type declarations
declare global {
  const google: {
    maps: {
      importLibrary(name: string): Promise<any>;
      Map: any;
      AdvancedMarkerElement: any;
      MapsLibrary: any;
      MarkerLibrary: any;
    };
  };
}

export {};
