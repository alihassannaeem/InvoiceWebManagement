import { AppService } from '../shared/app.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormGroup, FormArray } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

declare var window: any;
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: []
})
export class HomeComponent implements OnInit {
  invoices;
  formModalB: any;
  formModel: FormGroup;
  total: any = 0.0;
  currentDate = new Date();
  btnText: string;

  constructor(private router: Router, private service: AppService, private fb: FormBuilder, private toastr: ToastrService) {
    this.formModel = this.fb.group({
      Id: [0],
      PurchaseOrderNo: ['', Validators.required],
      Amount: [0],
      InvoiceNote: [''],
      items: this.fb.array([])
    });
  }


  ngOnInit() {
    this.formModalB = new window.bootstrap.Modal(
      document.getElementById('Invmodal')
    );

    this.service.getInvoices().subscribe(
      res => {
        this.invoices = res;
      },
      err => {
        console.log(err);
      },
    );
  }

  editInvoice(id: number) {
    this.clearFormArray(this.items);
    this.formModel.reset();
    this.total = 0;
    this.populateForm(this.invoices.filter(x => x.id === id)[0]);
    this.formModalB.show();
    this.btnText = "Update Invoice";
  }

  populateForm(data: any) {
    this.formModel.patchValue({
      Id: data.id,
      PurchaseOrderNo: data.purchaseOrderNo,
      Amount: data.amount,
      InvoiceNote: data.invoiceNote
    });

    data.items.forEach((el: Items) => {
      this.populateItems(el);
    });
  }

  populateItems(data: Items) {
    // List of particulars
    this.items.push(this.createItems(data));
  }

  createItems(data?: Items): FormGroup {
    return this.fb.group({
      id: [data && data.id ? data.id : 0, ''],
      itemRate: [data && data.itemRate ? data.itemRate : 0.0, Validators.required],
      itemName: [data && data.itemName ? data.itemName : '', Validators.required],
      qty: [data && data.qty ? data.qty : 0, Validators.required],
      amount: [0],
    });
  }

  get items(): FormArray {
    return <FormArray>this.formModel.get('items');
  }

  addItem(): void {
    this.items.push(this.createItems());
  }

  onSubmit() {
    this.service.createUpdateInvoice(this.formModel.value).subscribe(
      (res: any) => {
        if (res.succeeded) {
          
          this.closePopup();
          this.ngOnInit();
          if (this.formModel.value.Id != null) {
            this.toastr.success('Invoice Updated Successfully!', '');
          } else {
            this.toastr.success('Invoice Created Successfully!', '');
          }
          this.formModel.reset();
        } else {
          this.toastr.error('Not able to create invoice', 'Error!');
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  onControlChange(event: any, itemIndex: number): void {
    if (event.srcElement) {
      const controlName = event.srcElement.name;
      if (controlName === 'qty' || controlName === 'itemRate') {
        this.calculateAmount(itemIndex);
      }
    }
  }

  calculateAmount(itemIndex: number) {
    const itemsList = this.items;
    const igroup = itemsList.controls[itemIndex] as FormGroup;

    const quantity = igroup.get('qty');
    const ratePerUnit = igroup.get('itemRate');
    const amount = igroup.get('amount');

    amount?.setValue('');

    if (quantity?.value && ratePerUnit?.value) {
      const amt = quantity.value * ratePerUnit.value;
      amount?.setValue(amt);
      this.total = this.total + amt;
      this.formModel.controls['Amount'].setValue(this.total);
    }
  }

  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/user/login']);
  }
  openPopup() {
    this.formModel.reset();
    this.total = 0;
    this.clearFormArray(this.items);
    this.items.push(this.createItems());
    this.formModalB.show();
    this.btnText = "Create Invoice";
  }
  closePopup() {
    this.formModalB.hide();
  }

  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }
}

export interface Items {
  id: number;
  itemName: string;
  itemRate: number;
  qty: number;
  amount: number;
}
