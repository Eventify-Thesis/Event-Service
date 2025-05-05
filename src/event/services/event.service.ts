import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { PaymentInfo } from '../entities/payment-info.entity';
import { Setting } from '../entities/setting.entity';
import { Show } from '../entities/show.entity';
import { EventType, MESSAGE } from '../event.constant';
import { AppException } from 'src/common/exceptions/app.exception';
import { EventDetailResponse } from '../dto/event-doc.dto';
import { City } from 'src/location/entities/city.entity';
import { Ward } from 'src/location/entities/ward.entity';
import { District } from 'src/location/entities/district.entity';

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(District)
    private readonly districtRepository: Repository<District>,
    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>,
  ) { }

  async findAll(): Promise<Event[]> {
    return this.eventRepository.find({
      relations: ['paymentInfo', 'setting', 'shows'],
    });
  }

  async findOne(id: number): Promise<EventDetailResponse> {
    try {
      const event = await this.eventRepository.findOne({
        where: { id },
        relations: ['paymentInfo', 'setting', 'shows', 'shows.ticketTypes'],
      });

      // Find minimum startime of all shows

      const startTime = event.shows.reduce((min, show) => {
        return show.startTime < min ? show.startTime : min;
      }, new Date());
      const endTime = event.shows.reduce((max, show) => {
        return show.endTime > max ? show.endTime : max;
      }, new Date());

      let address = {
        addressVi: '',
        addressEn: '',
      };
      if (event.eventType === EventType.OFFLINE) {
        address.addressVi = event.street;
        address.addressEn = event.street;

        const ward = await this.wardRepository.findOne({
          where: { originId: event.wardId },
        });

        address.addressVi += ', ' + ward.name;
        address.addressEn += ', ' + ward.nameEn;

        const district = await this.districtRepository.findOne({
          where: { originId: event.districtId },
        });

        address.addressVi += ', ' + district.name;
        address.addressEn += ', ' + district.nameEn;

        const city = await this.cityRepository.findOne({
          where: { originId: event.cityId },
        });

        address.addressVi += ', ' + city.name;
        address.addressEn += ', ' + city.nameEn;
      } else {
        address.addressVi = 'Trực tuyến';
        address.addressEn = 'Online';
      }

      return {
        ...event,
        address,
        startTime,
        endTime,
      };
    } catch (error) {
      return null;
    }
  }

  async checkExists(id: number) {
    try {
      const event = await this.eventRepository.findOne({
        where: { id },
      });
      return !!event;
    } catch (error) {
      return false;
    }
  }

  async getEventShowDetails(eventId: number, showId: number) {
    try {
      const show = await this.showRepository.findOne({
        where: { eventId, id: showId },
        relations: ['ticketTypes'],
      });

      return show;
    } catch (error) {
      return null;
    }
  }
}
