import React, { createContext, useState } from "react";

export const PointsContext = createContext();

export const PointsProvider = ({ children }) => {
  const [easyPoints, setEasyPoints] = useState(0);
  const [mediumPoints, setMediumPoints] = useState(0);
  const [hardPoints, setHardPoints] = useState(0);
  const [bonusPoints, setBonusPoints] = useState(0);

  return (
    <PointsContext.Provider
      value={{
        easyPoints,
        setEasyPoints,
        mediumPoints,
        setMediumPoints,
        hardPoints,
        setHardPoints,
        bonusPoints,
        setBonusPoints,
      }}
    >
      {children}
    </PointsContext.Provider>
  );
};
