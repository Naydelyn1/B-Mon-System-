import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('resumen')
  getResumen() {
    return this.dashboardService.getResumen();
  }

  @Get('stats-publicos')
  getStatsPublicos() {
    return this.dashboardService.getStatsPublicos();
  }
}
