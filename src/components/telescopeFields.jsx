export const telescopeFields = {
  kepler: [
    { id: "koi_score", label: "Photometric Stability Index" },
    { id: "koi_fpflag_nt", label: "Not Transit Flag" },
    { id: "koi_model_snr", label: "Signal-to-Noise Ratio" },
    { id: "koi_fpflag_co", label: "Centroid Offset" },
    { id: "koi_fpflag_ss", label: "Secondary Star Flag" },
    { id: "koi_fpflag_ec", label: "Eclipsing Binary" },
    { id: "koi_duration_err2", label: "Duration Error" },
    { id: "koi_prad", label: "Planetary Radius" },
    { id: "koi_depth_err2", label: "Depth Error" },
    { id: "koi_tce_plnt_num", label: "Planet Number" },
  ],

  k2: [
    { id: "pl_orbper", label: "Orbital Period" },
    { id: "pl_rade", label: "Planet Radius (Earth radii)" },
    { id: "pl_radj", label: "Planet Radius (Jupiter radii)" },
    { id: "pl_bmasse", label: "Planet Mass (Earth mass)" },
    { id: "pl_orbeccen", label: "Orbital Eccentricity" },
    { id: "pl_eqt", label: "Equilibrium Temperature" },
    { id: "st_teff", label: "Stellar Temperature" },
    { id: "st_rad", label: "Stellar Radius" },
    { id: "st_mass", label: "Stellar Mass" },
    { id: "sy_snum", label: "Number of Stars in System" },
  ],

  tess: [
    { id: "pl_orbper", label: "Orbital Period" },
    { id: "pl_trandurh", label: "Transit Duration (hrs)" },
    { id: "pl_trandep", label: "Transit Depth" },
    { id: "pl_rade", label: "Planet Radius (Earth radii)" },
    { id: "pl_insol", label: "Insolation Flux" },
    { id: "pl_eqt", label: "Equilibrium Temperature" },
    { id: "st_tmag", label: "Stellar Magnitude" },
    { id: "st_teff", label: "Stellar Effective Temperature" },
    { id: "st_rad", label: "Stellar Radius" }
  ]
};