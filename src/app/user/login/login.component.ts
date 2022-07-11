import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../shared/app.service';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styles: []
})
export class LoginComponent implements OnInit {
  formModel = {
    UserName: '',
    Password: ''
  }
  constructor(private service: AppService, private router: Router, private toastr: ToastrService) { }

  ngOnInit() {
    if (localStorage.getItem('token') != null)
      this.router.navigateByUrl('/home');
  }

  onSubmit(form: NgForm) {
    this.service.login(form.value).subscribe(
      (res: any) => {        
        if(res.succeeded){
          localStorage.setItem('token', res.tokenResponse.authToken);
          this.toastr.success('', 'Logged in successfully', {
            positionClass: 'toast-bottom-right' 
         });
          this.router.navigateByUrl('/home');
        }
        else
        {
            this.toastr.error('Incorrect username or password.', 'Authentication failed.');
        }
      },
      err => {
        if (err.status == 400)
          this.toastr.error('Incorrect username or password.', 'Authentication failed.');
        else
          console.log(err);
      }
    );
  }
}
