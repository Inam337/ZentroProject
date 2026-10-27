import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../entities/category.entity';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryRepository } from './category.repository';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Category])],
  providers: [CategoryRepository, CategoryService],
  controllers: [CategoryController],
  exports: [CategoryRepository, TypeOrmModule],
})
export class CategoryModule {}
