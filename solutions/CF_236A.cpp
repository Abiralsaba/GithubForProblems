#include <bits/stdc++.h>
   using namespace std;

   int main() {
       string s;
       cin >> s;
       bool seen[26];
       for(int i = 0; i < 26; i++) seen[i] = false;
       int distinct = 0;
       for(int i = 0; i < s.length(); i++) {
           int idx = s[i] - 'a';
           if(!seen[idx]) {
               seen[idx] = true;
               distinct++;
           }
       }
       if(distinct % 2 == 1) cout << "CHAT WITH HER!" << endl;
       else cout << "IGNORE HIM!" << endl;
       return 0;
   }
