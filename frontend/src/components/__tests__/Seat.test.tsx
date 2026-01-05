import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Seat } from '../Seat/Seat.js';
import type { Seat as SeatType } from '../../types/index.js';

const createMockSeat = (overrides?: Partial<SeatType>): SeatType => ({
  id: 'A-1-01',
  col: 1,
  x: 100,
  y: 100,
  status: 'available',
  priceTier: 1,
  ...overrides,
});

// Helper to wrap Seat component in SVG for testing
const renderSeatInSvg = (props: Parameters<typeof Seat>[0]) => {
  return render(
    <svg>
      <Seat {...props} />
    </svg>
  );
};

describe('Seat Component', () => {
  it('should render available seat', () => {
    const seat = createMockSeat();
    const onClick = vi.fn();

    renderSeatInSvg({
      seat,
      isSelected: false,
      onClick,
      showHeatMap: false,
    });

    const seatElement = screen.getByRole('button', { name: /Seat A-1-01/ });
    expect(seatElement).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const seat = createMockSeat();
    const onClick = vi.fn();

    renderSeatInSvg({
      seat,
      isSelected: false,
      onClick,
      showHeatMap: false,
    });

    const seatElement = screen.getByRole('button', { name: /Seat A-1-01/ });
    await user.click(seatElement);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick for non-available seats', async () => {
    const user = userEvent.setup();
    const seat = createMockSeat({ status: 'sold' });
    const onClick = vi.fn();

    renderSeatInSvg({
      seat,
      isSelected: false,
      onClick,
      showHeatMap: false,
    });

    // Sold seats don't have button role, find by aria-label instead
    const seatElement = screen.getByLabelText(/Seat A-1-01.*Sold/);
    await user.click(seatElement);

    expect(onClick).not.toHaveBeenCalled();
  });

  it('should show selected state', () => {
    const seat = createMockSeat();
    const onClick = vi.fn();

    renderSeatInSvg({
      seat,
      isSelected: true,
      onClick,
      showHeatMap: false,
    });

    const seatElement = screen.getByRole('button', { name: /Seat A-1-01/ });
    expect(seatElement).toBeInTheDocument();
    expect(seatElement).toHaveAttribute('aria-pressed', 'true');
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    const seat = createMockSeat();
    const onKeyDown = vi.fn();
    const onClick = vi.fn();

    renderSeatInSvg({
      seat,
      isSelected: false,
      onClick,
      onKeyDown,
      showHeatMap: false,
    });

    const seatElement = screen.getByRole('button', { name: /Seat A-1-01/ });
    seatElement.focus();
    
    // Test Enter key triggers onClick (not onKeyDown)
    await user.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
    
    // Test Arrow key triggers onKeyDown
    await user.keyboard('{ArrowRight}');
    expect(onKeyDown).toHaveBeenCalled();
  });
});

