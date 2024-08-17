import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, signal } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { HttpClientModule } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import {MatSnackBar} from '@angular/material/snack-bar';


@Component({
  selector: 'app-animation',
  standalone: true,
  imports: [
    HttpClientModule, 
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
  ],
  providers: [PokemonService],
  templateUrl: './animation.component.html',
  styleUrl: './animation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export default class AnimationComponent implements OnDestroy{
  pokemonNameOrId = signal('')
  loading = signal(false);
  pokemonData = signal<any>(null);
  animationArray = signal<string[]>([]);
  indiceActual = signal(0);
  animating = signal(false);

  imagenActual = computed(() => {
    const array = this.animationArray();
    return array.length > 0 ? array[this.indiceActual()] : '';
  });
  
  constructor( 
    private pokemonService: PokemonService,
    private _snackBar: MatSnackBar
    ){
      effect(() => {
        if (this.animating()) {
          this.animateFrames();
        }
      });
    }
  ngOnDestroy(): void {
    this.detenerAnimacion();
  }

  playSound(soundSource: string){
    const audio = new Audio();
    audio.src = soundSource;
    audio.load();
    audio.play();
  }

  loadPokemon(){
    if(this.pokemonNameOrId().length > 0){
      this.detenerAnimacion();
      this.loading.set(true);
      this.pokemonService.getPokemon(this.pokemonNameOrId()).subscribe({
        next: (pokemon: any) =>{  
          this.pokemonData.set(pokemon);
          this.loading.set(false);
          console.log(this.pokemonData());
          this.animationArray.set([
            pokemon.sprites.front_default,
            pokemon.sprites.back_default
          ]);
          this.iniciarAnimacion();
          this.playSound(this.pokemonData().cries.latest)
        },
        error: (err: any) =>{ 
          console.log(err)
          this.openSnackBarError()
          this.loading.set(false)
        }
      })
    } else {
      this.openSnackSinData()
    }
  }

  openSnackBarError() {
    this._snackBar.open( 'Nombre o id de pokemon no válido', 'Cerrar', {duration: 3000} );
  }

  openSnackSinData() {
    this._snackBar.open( 'Escriba un nombre o id para cargar', 'Cerrar', {duration: 3000} );
  }

  iniciarAnimacion() {
    this.indiceActual.set(0);
    this.animating.set(true);
  }

  animateFrames() {
    setTimeout(() => {
      if (this.animating()) {
        this.indiceActual.update(index => (index + 1) % this.animationArray().length);
        this.animateFrames();
      }
    }, 300);
  }

  detenerAnimacion() {
    this.animating.set(false);
  }
  updateName(name: string) {
    this.pokemonNameOrId.set(name.toLocaleLowerCase());
  }
  
}
