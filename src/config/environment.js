// config/environment.js
const getConfig = () => {
  const isDev = process.env.NODE_ENV === "development";
  const isProd = process.env.NODE_ENV === "production";

  return {
    api: {
      baseURL: process.env.REACT_APP_API_URL,
      // timeout: parseInt(process.env.REACT_APP_API_TIMEOUT),
    },

    // App Configuration
    app: {
      name: "offroadperformance",
      version: process.env.REACT_APP_VERSION || "0.1.0",
      environment: process.env.REACT_APP_ENVIRONMENT || "development",
      debug: process.env.REACT_APP_DEBUG === "true",
      logLevel: process.env.REACT_APP_LOG_LEVEL || "info",
    },

    // Feature Flags
    features: {
      analytics: process.env.REACT_APP_ENABLE_ANALYTICS === "true",
      experimental:
        process.env.REACT_APP_ENABLE_EXPERIMENTAL_FEATURES === "true",
    },

    // Environment Helpers
    isDevelopment: isDev,
    isProduction: isProd,

    // External Services
    // services: {
    //   googleMaps: process.env.REACT_APP_GOOGLE_MAPS_KEY,
    //   stripe: process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
    // }
  };
};

export const config = getConfig();

// Enhanced validation with better error messages
const validateEnvironment = () => {
  const requiredVars = [
    { key: "REACT_APP_API_URL", description: "API base URL" },
  ];

  const missingVars = requiredVars.filter(({ key }) => !process.env[key]);

  if (missingVars.length > 0) {
    const errorMessage = `Missing required environment variables:\n${missingVars
      .map(({ key, description }) => `- ${key}: ${description}`)
      .join("\n")}\n\nPlease check your .env file.`;

    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Validate API URL format
  if (process.env.REACT_APP_API_URL) {
    try {
      new URL(process.env.REACT_APP_API_URL);
    } catch {
      throw new Error("REACT_APP_API_URL must be a valid URL");
    }
  }
};

// Run validation
validateEnvironment();

// Debug logging in development
// if (config.isDevelopment && config.app.debug) {
//   console.log('🔧 Environment Config:', {
//     environment: config.app.environment,
//     apiUrl: config.api.baseURL,
//     debug: config.app.debug,
//     features: config.features
//   });
// }
