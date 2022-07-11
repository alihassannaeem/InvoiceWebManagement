import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { isNgTemplate } from '@angular/compiler';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private fb: FormBuilder, private http: HttpClient) { }
  readonly BaseURI = 'http://localhost:60993/api';


  login(formData) {    
    return this.http.post(this.BaseURI + '/auth/login/', formData);
  }

  getInvoices() {    
    return this.http.get(this.BaseURI + '/Invoice/GetAll');
  }

  createUpdateInvoice(formData) {          
    formData.items.forEach(element => {
      element.itemRate = parseFloat(element.itemRate);
      element.qty = parseFloat(element.qty);      
    });

    if(formData.Id == null){
      formData.Id = 0;
    }
    var body = {
      id: formData.Id,
      purchaseOrderNo: formData.PurchaseOrderNo,
      amount: formData.Amount,
      invoiceNote: formData.InvoiceNote,
      items:formData.items
    };
    
    const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json'})
    }
    return this.http.post(this.BaseURI + '/Invoice/AddUpdateInvoice', body, httpOptions);
  }
  
}
