import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingTables1743826889556 implements MigrationInterface {
  name = 'CreateBookingTables1743826889556';
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum for order status
    await queryRunner.query(`
      CREATE TYPE order_status_enum AS ENUM ('PENDING', 'PAID', 'EXPIRED', 'CANCELLED');
    `);

    // Create orders table
    await queryRunner.query(`
      CREATE TABLE orders (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        event_id INTEGER NOT NULL,
        show_id INTEGER NOT NULL,
        booking_code UUID NOT NULL,
        status order_status_enum DEFAULT 'PENDING',
        subtotal_amount NUMERIC(10, 2),
        total_amount NUMERIC(10, 2),
        reserved_until TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT "fk_orders_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_orders_show" FOREIGN KEY ("show_id") REFERENCES "shows"("id") ON DELETE CASCADE
      );

      CREATE TABLE order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        ticket_type_id INTEGER NOT NULL,
        seat_id UUID,
        section_id UUID,
        quantity INTEGER DEFAULT 1,
        name VARCHAR,
        row_label VARCHAR,
        seat_number INTEGER,
        price NUMERIC(10, 2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        CONSTRAINT "fk_order_items_ticket_type" FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id),
        CONSTRAINT "fk_order_items_order" FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      );
      
      CREATE INDEX idx_orders_booking_code ON orders(booking_code);
      CREATE INDEX idx_orders_status ON orders(status);
      CREATE INDEX idx_orders_user_id ON orders(user_id);
      CREATE INDEX idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX idx_order_items_seat_id ON order_items(seat_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS order_items;`);
    await queryRunner.query(`DROP TABLE IF EXISTS orders;`);
    await queryRunner.query(`DROP TYPE IF EXISTS order_status_enum;`);
  }
}
