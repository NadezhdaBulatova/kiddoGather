import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  HostBinding,
} from '@angular/core';
import { PersonalInformationService } from '../../account/personal-information.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kid.component.html',
  styleUrl: './kid.component.css',
})
export class KidComponent implements OnInit {
  @Input() name: string = '';
  @Input() age: string = '';
  @Input() gender: string = '';
  @Input() id: string | undefined = '';
  @Input() small = false;
  ageClassification: string = '';
  ageToDisplay: string = '';
  @HostBinding('style.height.px') hostHeight: number = 100;

  constructor(
    private personalInformationService: PersonalInformationService,
    private cdr: ChangeDetectorRef
  ) {}

  dateDisplay() {
    const convertedAge = new Date(this.age);
    console.log(convertedAge.getFullYear());
    const differenceInTime =
      new Date().getFullYear() - convertedAge.getFullYear();
    if (differenceInTime < 1) {
      this.ageClassification = 'baby';
      this.ageToDisplay = `${Math.floor(differenceInTime * 12)} months old`;
    } else if (differenceInTime >= 1 && differenceInTime < 4) {
      this.ageClassification = 'toddler';
      this.ageToDisplay = `${differenceInTime.toFixed(1)} years old`;
    } else if (differenceInTime >= 4 && differenceInTime < 12) {
      this.ageClassification = 'child';
      this.ageToDisplay = `${Math.floor(differenceInTime)} years old`;
    }
  }

  ngOnInit() {
    if (this.small) this.hostHeight = 70;
    this.dateDisplay();
  }

  get icon() {
    if (this.ageClassification === 'baby') {
      return '../../assets/icons/baby.png';
    } else if (this.ageClassification === 'toddler') {
      return '../../assets/icons/toddler.png';
    } else if (this.ageClassification === 'child' && this.gender === 'boy') {
      return '../../assets/icons/child-boy.png';
    } else {
      return '../../assets/icons/child-girl.png';
    }
  }

  deleteKidEntry(kidId: string | undefined) {
    if (kidId) {
      this.personalInformationService.deleteKid(kidId).subscribe({
        next: (res) => {
          if (res.data.deleteKid.boolean) {
            this.personalInformationService.kids.set(
              this.personalInformationService.kids().filter((kid) => {
                return kid.id !== kidId;
              })
            );
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
    }
  }
}
