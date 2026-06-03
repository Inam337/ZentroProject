import React from 'react';

interface FieldErrorProps {
  msg?: string;
}

export default function FieldError(
  { msg }:
  FieldErrorProps) {
  if (!msg) return null;

  return <p className="text-sm text-red-500 mt-1">{msg}</p>;
}
