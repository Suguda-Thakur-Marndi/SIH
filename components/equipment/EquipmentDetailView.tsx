"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Tractor, ArrowLeft, CheckCircle2
} from 'lucide-react';

export default function EquipmentDetailView({ equipmentId }: { equipmentId: string }) {
  const [days, setDays] = useState(1);
  const [operatorRequired, setOperatorRequired] = useState(true);
  const [booked, setBooked] = useState(false);
  const [equipment, setEquipment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/equipment/${equipmentId}`)
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('Equipment not found');
          throw new Error('Failed to fetch equipment details');
        }
        return res.json();
      })
      .then((data) => {
        setEquipment(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [equipmentId]);

  if (loading) return <div className="p-8">Loading equipment details...</div>;
  if (error || !equipment) return <div className="p-8 text-red-600">Error: {error || 'Equipment not found'}</div>;

  const baseDailyRate = equipment.price_per_hour;
  
  if (typeof baseDailyRate !== 'number') {
    console.warn(`Expected price_per_hour to be a number, got ${typeof baseDailyRate}`);
  }

  const operatorFeePerDay = operatorRequired ? 250 : 0;
  // Trusting the number type coming from API, but ensuring math doesn't concatenate just in case
  const totalCost = (baseDailyRate + operatorFeePerDay) * days;

  const handleBook = async () => {
    setBookingError(null);
    try {
      const start_date = new Date().toISOString().split('T')[0];
      const endDateObj = new Date();
      endDateObj.setDate(endDateObj.getDate() + days);
      const end_date = endDateObj.toISOString().split('T')[0];

      const res = await fetch(`/api/equipment/${equipmentId}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // Using a placeholder farmer ID since there is no server-side auth mechanism
          farmer_id: 'FRM_DEMO_001', 
          start_date,
          end_date
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to book equipment');
      }

      setBooked(true);
    } catch (err: any) {
      setBookingError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2EF] text-[#1A1A1A] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Link 
            href="/equipment" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-black/10 shadow-sm text-sm font-medium hover:bg-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Equipment Hub
          </Link>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            {equipment.availability}
          </span>
        </div>

        {/* Hero Card */}
        <div className="bg-[#1A1A1A] text-white rounded-[28px] p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold text-[#CFE362] uppercase tracking-wider">{equipment.category} &bull; {equipment.id}</span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{equipment.name}</h1>
            <p className="text-neutral-300 text-xs md:text-sm max-w-2xl">
              Provider: {equipment.provider} <br />
              Location: {equipment.location}
            </p>
          </div>
        </div>

        {/* Booking Form & Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Specs (7 cols) */}
          <div className="md:col-span-7 bg-white/80 backdrop-blur-md rounded-[28px] p-6 border border-black/5 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
              <Tractor className="w-5 h-5 text-neutral-700" />
              Technical Specifications & Hub Location
            </h2>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl">
                <span className="text-neutral-500 font-medium">Provider</span>
                <div className="font-bold text-neutral-900 text-sm mt-0.5">{equipment.provider}</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <span className="text-neutral-500 font-medium">Category</span>
                <div className="font-bold text-neutral-900 text-sm mt-0.5">{equipment.category}</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <span className="text-neutral-500 font-medium">CHC Hub / Location</span>
                <div className="font-bold text-neutral-900 text-sm mt-0.5">{equipment.location}</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl">
                <span className="text-neutral-500 font-medium">Subsidy Applicable</span>
                <div className="font-bold text-emerald-700 text-sm mt-0.5">50% DBT</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
              <div className="font-bold text-neutral-900">Included:</div>
              <div className="text-neutral-600">&bull; Standard attachments</div>
              <div className="text-neutral-600">&bull; Routine maintenance check prior to delivery</div>
            </div>
          </div>

          {/* Booking / Rental Calculator (5 cols) */}
          <div className="md:col-span-5 bg-white/90 backdrop-blur-md rounded-[28px] p-6 border border-black/10 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-base font-bold text-neutral-900">Instant CHC Rental Booking</h3>

              {booked ? (
                <div className="p-6 rounded-2xl bg-emerald-50 text-center space-y-2 border border-emerald-200">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <div className="font-bold text-emerald-900 text-sm">Booking Confirmed!</div>
                  <p className="text-xs text-emerald-800">
                    Your request has been registered. The operator will contact you prior to arrival.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-neutral-600 font-semibold mb-1">Rental Duration (Days)</label>
                    <input 
                      type="number"
                      min={1}
                      max={14}
                      value={days}
                      onChange={(e) => setDays(Math.max(1, Number(e.target.value)))}
                      className="w-full p-2.5 bg-neutral-50 border border-black/10 rounded-xl font-bold text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <span className="font-medium text-neutral-700">Include Certified Operator</span>
                    <input 
                      type="checkbox"
                      checked={operatorRequired}
                      onChange={(e) => setOperatorRequired(e.target.checked)}
                      className="w-4 h-4 rounded text-neutral-900"
                    />
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="p-3 bg-neutral-100 rounded-xl space-y-1 text-neutral-700">
                    <div className="flex justify-between">
                      <span>Machinery Charge ({days}d &times; ₹{baseDailyRate})</span>
                      <span className="font-semibold">₹{days * baseDailyRate}</span>
                    </div>
                    {operatorRequired && (
                      <div className="flex justify-between">
                        <span>Operator Daily Fee ({days}d &times; ₹250)</span>
                        <span className="font-semibold">₹{days * 250}</span>
                      </div>
                    )}
                    <div className="border-t border-neutral-300 pt-1 flex justify-between font-bold text-sm text-neutral-900">
                      <span>Total Estimated Cost</span>
                      <span className="text-emerald-700">₹{totalCost}</span>
                    </div>
                  </div>

                  {bookingError && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium border border-red-200">
                      {bookingError}
                    </div>
                  )}

                  <button
                    onClick={handleBook}
                    disabled={equipment.availability !== 'Available Now'}
                    className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition ${
                      equipment.availability === 'Available Now' 
                        ? 'bg-neutral-900 hover:bg-black text-white' 
                        : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    {equipment.availability === 'Available Now' ? 'Confirm CHC Rental Request' : 'Equipment Unavailable'}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
