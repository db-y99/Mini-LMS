'use client';
import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { LoanProduct, CreateLoanProductDTO } from '@/types/product';

interface LoanProductFormProps {
  product?: LoanProduct | null;
  onSave: (data: CreateLoanProductDTO) => void;
  onCancel: () => void;
}

export const LoanProductForm: React.FC<LoanProductFormProps> = ({
  product,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<CreateLoanProductDTO>({
    code: '',
    name: '',
    description: '',
    minAmount: 1000000,
    maxAmount: 50000000,
    minDuration: 1,
    maxDuration: 12,
    interestRate: 24,
    interes