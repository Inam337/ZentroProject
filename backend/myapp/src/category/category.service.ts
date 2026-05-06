import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Repository } from 'typeorm';
@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepo: Repository<Category>,
  ) {}
  findAll() {
    return this.categoryRepo.find();
  }
  findOne(id: number) {
    return this.categoryRepo.findOne({ where: { id } });
  }

  create(data: Partial<Category>) {
    const category = this.categoryRepo.create(data);
    return this.categoryRepo.save(category);
  }

  update(id: number, data: Partial<Category>) {
    return this.categoryRepo.update(id, data);
  }

  delete(id: number) {
    return this.categoryRepo.delete(id);
  }
}
