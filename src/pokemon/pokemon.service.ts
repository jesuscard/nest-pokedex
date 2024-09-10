import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';

import { Pokemon } from './entities/pokemon.entity';


@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>
  ){

  }
  async create(
    createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.handleExceptions(error)
    }

  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {
    let pokemon: Pokemon;
    //no
    if (!isNaN(+term)){
      pokemon = await this.pokemonModel.findOne( { no: term })
    }

    //mongoId
    if( !pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term)
    }

    //name
    if( !pokemon && isValidObjectId(term)){
        pokemon = await this.pokemonModel.findOne({ name: term })
    }


    if(!pokemon) throw new NotFoundException(`Pokemon with id ${term} not found`)

    return pokemon
    // return `This action returns a #${id} pokemon`;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term)
    if ( updatePokemonDto.name )
        updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase()

    try {
      
    await pokemon.updateOne( updatePokemonDto, { new : true })
    return { ...pokemon.toJSON(), ...updatePokemonDto }
    } catch (error) {
      this.handleExceptions(error)
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne( id)
    // await pokemon.deleteOne()

    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id})

    if ( deletedCount === 0 ){
      throw new BadRequestException(`Pokemon with id ${id} not found`)
    }

    return
  }


  private handleExceptions ( error: any){
    if( error.code === 11000){
      throw new BadRequestException(`Pokemon exists in db # ${ JSON.stringify( error.keyValue)}`)
    }
    console.log("errr", error)
    throw new InternalServerErrorException(`can't create Pkemon -Check server logs`)
  }
}
