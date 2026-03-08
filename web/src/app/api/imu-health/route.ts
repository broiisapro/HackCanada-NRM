import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:5000/api/imu-health', {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch health');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { status: 'error', imu_connected: false },
      { status: 500 }
    );
  }
}
