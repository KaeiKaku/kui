import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StatusObject, StatusService } from './service/status.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'kui';
  constructor(private statusService: StatusService) {
    // const config: StatusObject = {
    //   hello: 'string hello',
    //   person: {
    //     name: 'Alice',
    //     age: 25,
    //     gender: 'female',
    //     friends: [
    //       {
    //         name: 'Bob',
    //         age: 27,
    //         gender: 'male',
    //         interests: ['sports', 'music'],
    //       },
    //       {
    //         name: 'Carol',
    //         age: 24,
    //         gender: 'female',
    //         interests: ['reading', 'traveling'],
    //       },
    //     ],
    //     job: {
    //       title: 'Software Engineer',
    //       company: 'Tech Corp',
    //       years_of_experience: 3,
    //     },
    //   },
    //   pet: {
    //     name: 'Max',
    //     species: 'dog',
    //     age: 3,
    //     color: 'brown',
    //     toys: ['ball', 'rope'],
    //   },
    // };
    // this.statusService.initStatus('x', config);
  }
}
