import React from 'react';
import MyPortfolio from './MyPortfolio';

export default function PublicProfile({ userId, onBack }) {
  return <MyPortfolio userId={userId} onBack={onBack} />;
}
