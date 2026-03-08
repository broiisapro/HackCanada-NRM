import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:5000/api/imu-data', {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch IMU data');
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch IMU data' },
      { status: 500 }
    );
  }
}
